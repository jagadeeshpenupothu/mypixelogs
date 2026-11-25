import {
  ALL_FORMATS,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  canEncodeAudio,
  canEncodeVideo,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  VideoSampleSink,
  type VideoSample,
} from "mediabunny";

import timeline from "@/data/video-templates/wedding-timeline.json";
import { weddingVideo } from "@/data/video-templates/wedding";
import type { FontId, PhotoEdit, PhotoId, ThemeId, VideoContent } from "@/types/video-template";

export class VideoTemplateError extends Error {}
export class VideoTemplateCanceled extends Error {}

export const DURATION = timeline.duration;
export const FRAME_RATE = timeline.frameRate;
export const FRAMES = Math.round(DURATION * FRAME_RATE);
const { width: WIDTH, height: HEIGHT } = weddingVideo.size;

// ---------------------------------------------------------------- Keyframes

type Value = number | number[];
type Track = Value | (number | number[])[][];

function valueAt(track: unknown, time: number): Value {
  const keys = track as [number, Value, number][];
  if (!Array.isArray(track) || !Array.isArray(track[0])) return track as Value;
  if (time <= keys[0][0]) return keys[0][1];
  for (let index = 1; index < keys.length; index += 1) {
    const [to, next] = keys[index];
    if (time > to) continue;
    const [from, value, eased] = keys[index - 1];
    let share = to === from ? 1 : (time - from) / (to - from);
    if (eased) share = share * share * (3 - 2 * share);
    return Array.isArray(value)
      ? value.map((part, place) => part + ((next as number[])[place] - part) * share)
      : value + ((next as number) - value) * share;
  }
  return keys[keys.length - 1][1];
}

const numberAt = (track: Track | unknown, time: number) => valueAt(track, time) as number;
const pointAt = (track: Track | unknown, time: number) => valueAt(track, time) as [number, number];

// ---------------------------------------------------------------- Fonts

export const fonts: Record<FontId, { name: string; display: string; text: string; displayWeight: number; textWeight: number }> = {
  classic: { name: "Classic", display: '"Noto Serif Telugu", "Playfair Display", serif', text: '"Noto Serif Telugu", "Playfair Display", serif', displayWeight: 700, textWeight: 500 },
  elegant: { name: "Elegant", display: '"Tiro Telugu", serif', text: '"Tiro Telugu", serif', displayWeight: 400, textWeight: 400 },
  bold: { name: "Bold", display: '"Ramaraja", "Playfair Display", serif', text: '"Noto Sans Telugu", sans-serif', displayWeight: 400, textWeight: 600 },
  simple: { name: "Simple", display: '"Mallanna", sans-serif', text: '"Mallanna", sans-serif', displayWeight: 400, textWeight: 400 },
};

const SMALL_FONT = '"Noto Sans Telugu", sans-serif';

export async function loadFonts(font: FontId, texts: Record<string, string>) {
  const sample = `${Object.values(texts).join(" ")} అ A`;
  const choice = fonts[font];
  await Promise.all(
    [
      `${choice.displayWeight} 60px ${choice.display}`,
      `${choice.textWeight} 60px ${choice.text}`,
      `500 60px ${SMALL_FONT}`,
    ].map((name) => document.fonts.load(name, sample).catch(() => [])),
  );
}

// ---------------------------------------------------------------- Transparent video

const vertex = `#version 300 es
out vec2 v;
void main() { vec2 q = vec2(gl_VertexID & 1, gl_VertexID >> 1) * 2.0; v = vec2(q.x, 1.0 - q.y); gl_Position = vec4(q * 2.0 - 1.0, 0, 1); }`;

/** The colours are in the top half of each frame and their opacity in the bottom half. */
const fragment = `#version 300 es
precision highp float;
in vec2 v; out vec4 o; uniform sampler2D t;
void main() {
  float a = texture(t, vec2(v.x, clamp(v.y * 0.5 + 0.5, 0.5005, 1.0))).r;
  a = a < 0.012 ? 0.0 : a;
  vec3 c = texture(t, vec2(v.x, min(v.y * 0.5, 0.4995))).rgb;
  o = vec4(min(c, vec3(a)), a);
}`;

class Unpacker {
  readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    const gl = this.canvas.getContext("webgl2", { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
    if (!gl) throw new VideoTemplateError("Your browser cannot draw this template. Try the latest Chrome, Edge or Safari.");
    this.gl = gl;
    const program = gl.createProgram();
    for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.viewport(0, 0, width, height);
  }

  draw(sample: VideoSample) {
    const frame = sample.toVideoFrame();
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, frame);
    frame.close();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/** One layer of moving artwork, read frame by frame. */
class Layer {
  private constructor(
    private readonly input: Input,
    private readonly sink: VideoSampleSink,
    private readonly unpacker: Unpacker,
  ) {}
  private samples: AsyncGenerator<VideoSample, void, unknown> | null = null;
  private waiting: VideoSample | null = null;
  private shown = -1;

  static async open(data: Blob) {
    const input = new Input({ source: new BlobSource(data), formats: ALL_FORMATS });
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode())) {
      input.dispose();
      throw new VideoTemplateError("Your browser cannot open this template's artwork. Try the latest Chrome, Edge or Safari.");
    }
    const unpacker = new Unpacker(await track.getDisplayWidth(), (await track.getDisplayHeight()) / 2);
    return new Layer(input, new VideoSampleSink(track), unpacker);
  }

  get canvas() {
    return this.unpacker.canvas;
  }

  /** Shows the frame at a time. Moving forwards a little is fast; anything else seeks. */
  async show(time: number) {
    const frame = Math.min(FRAMES - 1, Math.max(0, Math.floor(time * FRAME_RATE + 0.01)));
    if (frame === this.shown) return;
    if (!this.samples || frame < this.shown || frame > this.shown + 20) {
      await this.stop();
      this.samples = this.sink.samples(frame / FRAME_RATE);
    }
    let latest: VideoSample | null = null;
    for (;;) {
      const sample: VideoSample | null = this.waiting ?? (await this.samples.next()).value ?? null;
      this.waiting = null;
      if (!sample) break;
      if (Math.round(sample.timestamp * FRAME_RATE) > frame) {
        this.waiting = sample;
        break;
      }
      latest?.close();
      latest = sample;
      if (Math.round(sample.timestamp * FRAME_RATE) === frame) break;
    }
    if (latest) {
      this.unpacker.draw(latest);
      latest.close();
    }
    this.shown = frame;
  }

  private async stop() {
    this.waiting?.close();
    this.waiting = null;
    await this.samples?.return();
    this.samples = null;
  }

  async dispose() {
    await this.stop();
    this.unpacker.dispose();
    this.input.dispose();
  }
}

export type Artwork = { theme: ThemeId; middle: Layer; front: Layer; paper: ImageBitmap; cross: ImageBitmap };

export async function loadArtwork(theme: ThemeId, onProgress: (value: number) => void, signal: AbortSignal): Promise<Artwork> {
  const base = `${weddingVideo.assets}/${theme}`;
  const done = [0, 0];
  const total = [0, 0];
  async function fetchBlob(url: string, place: number) {
    const response = await fetch(url, { signal });
    if (!response.ok || !response.body) throw new VideoTemplateError("The template could not be loaded. Check your connection and try again.");
    total[place] = Number(response.headers.get("content-length")) || 0;
    const parts: Uint8Array<ArrayBuffer>[] = [];
    const reader = response.body.getReader();
    for (;;) {
      const { done: finished, value } = await reader.read();
      if (finished) break;
      parts.push(value);
      done[place] += value.byteLength;
      if (total[0] && total[1]) onProgress(Math.min(1, (done[0] + done[1]) / (total[0] + total[1])));
    }
    return new Blob(parts, { type: "video/mp4" });
  }
  const image = async (url: string) => createImageBitmap(await (await fetch(url, { signal })).blob());
  const opened: Layer[] = [];
  try {
    const [middleData, frontData, paper, cross] = await Promise.all([
      fetchBlob(`${base}-middle.mp4`, 0),
      fetchBlob(`${base}-front.mp4`, 1),
      image(`${base}-paper.webp`),
      image(`${base}-cross.webp`),
    ]);
    const middle = await Layer.open(middleData);
    opened.push(middle);
    const front = await Layer.open(frontData);
    opened.push(front);
    if (signal.aborted) throw new VideoTemplateCanceled();
    return { theme, middle, front, paper, cross };
  } catch (error) {
    for (const layer of opened) await layer.dispose();
    if (signal.aborted) throw new VideoTemplateCanceled();
    if (error instanceof VideoTemplateError) throw error;
    throw new VideoTemplateError("The template could not be loaded. Check your connection and try again.");
  }
}

export async function disposeArtwork(artwork: Artwork) {
  await Promise.all([artwork.middle.dispose(), artwork.front.dispose()]);
  artwork.paper.close();
  artwork.cross.close();
}

// ---------------------------------------------------------------- Text

type TextLayer = (typeof timeline.texts)[number];
type Look = { fill: string[]; edge: string; edgeLength: number; shadow: string };

const looks: Record<ThemeId, Record<string, Look>> = {
  gold: {
    gold: { fill: ["#8f5a12", "#b87c22", "#dfae52", "#a4670f"], edge: "#74440a", edgeLength: 4.5, shadow: "rgba(92,54,8,0.45)" },
    body: { fill: ["#143250", "#1c4468"], edge: "#6e829b", edgeLength: 1.5, shadow: "rgba(20,50,80,0.3)" },
    soft: { fill: ["#1f4f63", "#3f7a7c"], edge: "#9db4b8", edgeLength: 1.2, shadow: "rgba(20,50,80,0.25)" },
    accent: { fill: ["#a8690f"], edge: "#d8b98a", edgeLength: 1, shadow: "rgba(92,54,8,0.25)" },
    accentBold: { fill: ["#b5671c", "#8a4d12"], edge: "#d8b98a", edgeLength: 1.5, shadow: "rgba(92,54,8,0.25)" },
    light: { fill: ["#ffffff"], edge: "rgba(0,0,0,0.5)", edgeLength: 1.5, shadow: "rgba(0,0,0,0.75)" },
  },
  pink: {
    gold: { fill: ["#5f1b80", "#8a2a8c", "#c2559d", "#82206b"], edge: "#4a1463", edgeLength: 4.5, shadow: "rgba(90,30,90,0.4)" },
    body: { fill: ["#42166e", "#5c2488"], edge: "#b39ac4", edgeLength: 1.5, shadow: "rgba(80,30,80,0.28)" },
    soft: { fill: ["#a8347f", "#c2468f"], edge: "#e6c3d8", edgeLength: 1.2, shadow: "rgba(80,30,80,0.22)" },
    accent: { fill: ["#bf3f85"], edge: "#e2b9cd", edgeLength: 1, shadow: "rgba(110,40,80,0.22)" },
    accentBold: { fill: ["#bf3f85", "#7c2477"], edge: "#e2b9cd", edgeLength: 1.5, shadow: "rgba(110,40,80,0.22)" },
    light: { fill: ["#ffffff"], edge: "rgba(0,0,0,0.5)", edgeLength: 1.5, shadow: "rgba(0,0,0,0.75)" },
  },
};

type Drawing = { key: string; canvas: HTMLCanvasElement; x: number; y: number };

/** Draws each line once and reuses the picture until its words or look change. */
export class TextCache {
  private readonly drawings = new Map<string, Drawing>();

  get(layer: TextLayer, content: VideoContent, scale: number): Drawing | null {
    const words = (content.texts[layer.id] ?? "").trim();
    if (!words) return null;
    const key = [words, content.font, content.theme, content.textSize, scale].join("|");
    const known = this.drawings.get(layer.id);
    if (known?.key === key) return known;

    const choice = fonts[content.font];
    const display = layer.style === "gold";
    const small = layer.style === "accent";
    const family = small ? SMALL_FONT : display ? choice.display : choice.text;
    const weight = small ? 500 : display ? choice.displayWeight : choice.textWeight;
    const lines = words.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const font = (size: number) => `${weight} ${size}px ${family}`;
    const detail = scale * 1.2;
    let size = layer.size * (display ? 1.06 : 1) * content.textSize * detail;
    context.font = font(size);
    const widest = Math.max(1, ...lines.map((line) => context.measureText(line).width));
    const limit = layer.maxWidth * WIDTH * detail;
    if (widest > limit) size *= limit / widest;

    const step = size * 1.32;
    const room = size * 1.1;
    canvas.width = Math.ceil(Math.min(widest, limit) + room * 2);
    canvas.height = Math.ceil(step * (lines.length - 1) + size * 1.5 + room * 2);
    const look = looks[content.theme][layer.style];
    const baseline = room + size;
    const middle = canvas.width / 2;
    context.font = font(size);
    context.textAlign = "center";
    context.lineJoin = "round";

    const gradient = context.createLinearGradient(room, baseline - size, canvas.width - room, baseline + step * (lines.length - 1));
    look.fill.forEach((color, place) => gradient.addColorStop(look.fill.length === 1 ? 0 : place / (look.fill.length - 1), color));
    const write = (dx: number, dy: number) => lines.forEach((line, row) => context.fillText(line, middle + dx, baseline + row * step + dy));

    context.shadowColor = look.shadow;
    context.shadowBlur = 9 * detail;
    context.shadowOffsetX = context.shadowOffsetY = 3 * detail;
    context.fillStyle = look.edge;
    write(0, 0);
    context.shadowColor = "transparent";
    const edge = Math.max(1, look.edgeLength * detail * 0.75);
    for (let offset = edge; offset > 0; offset -= 0.5) write(offset, offset);
    if (display) {
      context.fillStyle = "rgba(255,240,205,0.85)";
      write(-0.9 * detail, -0.9 * detail);
    }
    context.fillStyle = gradient;
    write(0, 0);

    const drawing = { key, canvas, x: middle / detail, y: baseline / detail };
    this.drawings.set(layer.id, drawing);
    return drawing;
  }
}

// ---------------------------------------------------------------- One frame

export function photoLayout(photo: PhotoEdit, id: PhotoId) {
  const area = weddingVideo.photoAreas[id];
  const sideways = photo.turns % 2 === 1;
  const width = photo.image ? (sideways ? photo.image.height : photo.image.width) : area.width;
  const height = photo.image ? (sideways ? photo.image.width : photo.image.height) : area.height;
  const scale = Math.max(area.width / width, area.height / height) * photo.zoom;
  // The photo can move until its edge reaches the edge of its area.
  const limitX = Math.max(0, (width * scale - area.width) / 2 / area.width);
  const limitY = Math.max(0, (height * scale - area.height) / 2 / area.height);
  const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));
  return { area, scale, x: clamp(photo.x, limitX), y: clamp(photo.y, limitY), limitX, limitY };
}

function drawPhoto(context: CanvasRenderingContext2D, layer: (typeof timeline.photos)[number], photo: PhotoEdit, time: number) {
  const id = layer.id as PhotoId;
  const { area, scale, x, y } = photoLayout(photo, id);
  const first = pointAt(layer.pos, layer.start);
  const now = pointAt(layer.pos, time);
  const grow = numberAt(layer.scale, time) / numberAt(layer.scale, layer.start);
  context.save();
  context.translate(area.x + (now[0] - first[0]) * WIDTH, area.y + (now[1] - first[1]) * HEIGHT);
  context.scale(grow, grow);
  if (photo.image) {
    context.translate(x * area.width, y * area.height);
    context.scale(photo.flip ? -scale : scale, scale);
    context.rotate((photo.turns * Math.PI) / 2);
    const left = -photo.image.width / 2;
    const top = -photo.image.height / 2;
    context.drawImage(photo.image, left, top);
    // Brightness without canvas filters, which Safari does not have.
    if (photo.brightness > 1) {
      context.globalCompositeOperation = "lighter";
      context.globalAlpha = photo.brightness - 1;
      context.drawImage(photo.image, left, top);
    } else if (photo.brightness < 1) {
      context.fillStyle = `rgba(0,0,0,${1 - photo.brightness})`;
      context.fillRect(left, top, photo.image.width, photo.image.height);
    }
  } else {
    const { width, height } = area;
    const shade = context.createLinearGradient(0, -height / 2, 0, height / 2);
    shade.addColorStop(0, "#b9a79a");
    shade.addColorStop(1, "#7f6f68");
    context.fillStyle = shade;
    context.fillRect(-width / 2 - 40, -height / 2 - 40, width + 80, height + 80);
    context.fillStyle = "rgba(255,255,255,0.28)";
    for (const offset of id === "couple" ? [-330, 330] : [0]) {
      context.beginPath();
      context.arc(offset, -130, 150, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.ellipse(offset, 400, 310, 330, 0, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();
}

export async function drawFrame(
  canvas: HTMLCanvasElement,
  time: number,
  content: VideoContent,
  artwork: Artwork,
  cache: TextCache,
) {
  await Promise.all([artwork.middle.show(time), artwork.front.show(time)]);
  const context = canvas.getContext("2d", { alpha: false })!;
  const scale = canvas.width / WIDTH;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.globalAlpha = 1;
  context.imageSmoothingQuality = "high";

  const paperScale = numberAt(timeline.paperScale, time) / 100;
  context.drawImage(
    artwork.paper,
    (WIDTH * (1 - paperScale)) / 2,
    (HEIGHT * (1 - paperScale)) / 2,
    WIDTH * paperScale,
    HEIGHT * paperScale,
  );

  for (const layer of timeline.photos) {
    if (time >= layer.start - 0.002 && time < layer.end - 0.002) drawPhoto(context, layer, content.photos[layer.id as PhotoId], time);
  }

  context.drawImage(artwork.middle.canvas, 0, 0, WIDTH, HEIGHT);

  const { emblem } = timeline;
  const picture = content.emblem === "cross" ? artwork.cross : content.emblem === "custom" ? content.emblemImage : null;
  if (picture && time < emblem.end) {
    const [x, y] = pointAt(emblem.pos, time);
    // Every emblem fills the same 900-pixel square that the cross does.
    const ratio = (9 * numberAt(emblem.scale, time)) / Math.max(picture.width, picture.height);
    context.globalAlpha = numberAt(emblem.opacity, time) / 100;
    context.drawImage(picture, x * WIDTH - (picture.width * ratio) / 2, y * HEIGHT - (picture.height * ratio) / 2, picture.width * ratio, picture.height * ratio);
    context.globalAlpha = 1;
  }

  for (const layer of timeline.texts) {
    if (time < layer.start || time >= layer.end) continue;
    const opacity = numberAt(layer.opacity, time) / 100;
    const drawing = opacity > 0.003 ? cache.get(layer, content, scale) : null;
    if (!drawing) continue;
    const [x, y] = pointAt(layer.pos, time);
    const [shiftX, shiftY] = pointAt(layer.motion, time);
    const grow = numberAt(layer.scale, time) / 100;
    const words = numberAt(layer.textScale, time) / 100;
    const swivel = Math.cos((numberAt(layer.swivel, time) * Math.PI) / 180);
    const tilt = Math.cos((numberAt(layer.tilt, time) * Math.PI) / 180);
    context.save();
    context.globalAlpha = opacity;
    const blur = numberAt(layer.blur, time) * scale * 0.6;
    if (blur > 0.3 && "filter" in context) context.filter = `blur(${blur.toFixed(2)}px)`;
    context.translate((x + shiftX - 0.5) * WIDTH, (y + shiftY - 0.5) * HEIGHT);
    context.scale(grow * swivel, grow * tilt);
    context.translate((layer.at[0] - 0.5) * WIDTH, (layer.at[1] - 0.5) * HEIGHT);
    context.scale(words, words);
    const detail = scale * 1.2;
    context.drawImage(drawing.canvas, -drawing.x, -drawing.y, drawing.canvas.width / detail, drawing.canvas.height / detail);
    context.restore();
  }

  const fade = time < 0.4 ? 1 - time / 0.4 : time > 49.933 ? Math.min(1, (time - 49.933) / 0.55) : 0;
  if (fade > 0) {
    context.fillStyle = `rgba(255,255,255,${fade})`;
    context.fillRect(0, 0, WIDTH, HEIGHT);
  }
  context.drawImage(artwork.front.canvas, 0, 0, WIDTH, HEIGHT);
}

// ---------------------------------------------------------------- Music and export

export type Music = { buffer: AudioBuffer; name: string; start: number; volume: number };

export async function readMusic(file: File): Promise<AudioBuffer> {
  if (file.size > 100 * 1024 ** 2) throw new VideoTemplateError("Please choose a music file smaller than 100 MB.");
  const context = new OfflineAudioContext(2, 1, 48000);
  try {
    return await context.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new VideoTemplateError("This music file could not be opened. Try an MP3, M4A or WAV file.");
  }
}

/** Connects music to an audio graph, with short fades at both ends of the video. */
export function connectMusic(context: BaseAudioContext, music: Music, from: number) {
  const source = context.createBufferSource();
  source.buffer = music.buffer;
  source.loop = true;
  source.loopStart = Math.min(music.start, Math.max(0, music.buffer.duration - 1));
  source.loopEnd = music.buffer.duration;
  const gain = context.createGain();
  const begin = context.currentTime;
  const points = [[0, 0], [1, music.volume], [DURATION - 2.5, music.volume], [DURATION, 0]];
  const level = (time: number) => {
    const next = points.findIndex(([at]) => at >= time);
    if (next <= 0) return points[0][1];
    const [a, b] = [points[next - 1], points[next]];
    return a[1] + ((b[1] - a[1]) * (time - a[0])) / (b[0] - a[0]);
  };
  gain.gain.setValueAtTime(level(from), begin);
  for (const [at, value] of points) if (at > from) gain.gain.linearRampToValueAtTime(value, begin + at - from);
  source.connect(gain).connect(context.destination);
  const loopLength = source.loopEnd - source.loopStart;
  source.start(begin, source.loopStart + (from % loopLength));
  source.stop(begin + DURATION - from);
  return source;
}

async function mixMusic(music: Music) {
  const context = new OfflineAudioContext(2, Math.ceil((FRAMES / FRAME_RATE) * 48000), 48000);
  connectMusic(context, music, 0);
  return context.startRendering();
}

export type ExportSize = "full" | "small";
const exportSizes: Record<ExportSize, { width: number; height: number; bitrate: number }> = {
  full: { width: 1920, height: 810, bitrate: 10e6 },
  small: { width: 1280, height: 540, bitrate: 2.1e6 },
};

export async function exportVideo(
  content: VideoContent,
  artwork: Artwork,
  music: Music | null,
  size: ExportSize,
  onProgress: (value: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const { width, height, bitrate } = exportSizes[size];
  if (!("VideoEncoder" in window) || !(await canEncodeVideo("avc", { width, height, quality: new Quality({ bitrate }) }).catch(() => false))) {
    throw new VideoTemplateError("Your browser cannot make MP4 videos. Please use the latest Chrome, Edge or Safari.");
  }
  await loadFonts(content.font, content.texts);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d", { alpha: false });
  const cache = new TextCache();
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  try {
    const video = new CanvasSource(canvas, { codec: "avc", bitrate, keyFrameInterval: 2 });
    output.addVideoTrack(video, { frameRate: FRAME_RATE });
    let sound: AudioBufferSource | null = null;
    if (music) {
      const codec = (await canEncodeAudio("aac", { numberOfChannels: 2, sampleRate: 48000 }).catch(() => false)) ? "aac" : "opus";
      sound = new AudioBufferSource({ codec, bitrate: 160e3 });
      output.addAudioTrack(sound);
    }
    await output.start();
    if (music && sound) {
      await sound.add(await mixMusic(music));
      sound.close();
    }
    for (let frame = 0; frame < FRAMES; frame += 1) {
      if (signal.aborted) throw new VideoTemplateCanceled();
      await drawFrame(canvas, frame / FRAME_RATE, content, artwork, cache);
      await video.add(frame / FRAME_RATE, 1 / FRAME_RATE);
      if (frame % 10 === 0) {
        onProgress(frame / FRAMES);
        // Lets the page react to Cancel.
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    await output.finalize();
    onProgress(1);
    return new Blob([(output.target as BufferTarget).buffer!], { type: "video/mp4" });
  } catch (error) {
    await output.cancel().catch(() => undefined);
    if (signal.aborted) throw new VideoTemplateCanceled();
    if (error instanceof VideoTemplateError) throw error;
    throw new VideoTemplateError("The video could not be made. Close other tabs, or choose the smaller size, and try again.");
  }
}
