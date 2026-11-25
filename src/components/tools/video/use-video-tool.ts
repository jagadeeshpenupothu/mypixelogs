"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Progress, VideoInfo } from "@/lib/video-ffmpeg";

export type LoadedVideo<Info = VideoInfo> = { file: File; url: string; info: Info };
export type FinishedFile = { blob: Blob; url: string; name: string };

/** Opening a file, running one export at a time, and cleaning up after both. */
export function useVideoTool<Info = VideoInfo>(read: (file: File) => Promise<Info>) {
  const [loaded, setLoaded] = useState<LoadedVideo<Info> | null>(null);
  const [opening, setOpening] = useState(false);
  const [progress, setProgress] = useState<(Progress & { remaining: number | null }) | null>(null);
  const [result, setResult] = useState<FinishedFile | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const turnRef = useRef(0);
  const busy = progress !== null;

  useEffect(() => {
    const url = loaded?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [loaded]);

  useEffect(() => {
    const url = result?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [result]);

  useEffect(() => {
    // A file dropped beside the box would otherwise open in the tab.
    const ignore = (event: DragEvent) => event.preventDefault();
    window.addEventListener("dragover", ignore);
    window.addEventListener("drop", ignore);
    return () => {
      window.removeEventListener("dragover", ignore);
      window.removeEventListener("drop", ignore);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  const close = useCallback(() => {
    turnRef.current += 1;
    setLoaded(null);
    setResult(null);
    setError("");
    setNotice("");
  }, []);

  async function open(file: File | undefined, onOpen: (info: Info) => void) {
    if (!file || busy) return;
    close();
    const turn = turnRef.current;
    setOpening(true);
    const engine = await import("@/lib/video-engine");
    try {
      if (file.size === 0) throw new engine.VideoToolError("This file is empty.");
      if (file.size > engine.MAX_FILE_SIZE) throw new engine.VideoToolError("Please choose a file smaller than 2 GB.");
      const info = await read(file);
      if (turn !== turnRef.current) return;
      onOpen(info);
      setLoaded({ file, url: URL.createObjectURL(file), info });
    } catch (problem) {
      if (turn !== turnRef.current) return;
      setError(problem instanceof engine.VideoToolError ? problem.message : "This file could not be opened.");
    } finally {
      if (turn === turnRef.current) setOpening(false);
    }
  }

  /** Any change of settings makes an earlier export out of date. */
  const changed = useCallback(() => {
    setResult(null);
    setError("");
    setNotice("");
  }, []);

  async function run(
    name: string,
    work: (onProgress: (progress: Progress) => void, signal: AbortSignal) => Promise<Blob>,
  ) {
    if (busy) return;
    const controller = new AbortController();
    abortRef.current = controller;
    changed();
    const started = performance.now();
    setProgress({ stage: "loading", value: 0, remaining: null });
    const engine = await import("@/lib/video-engine");
    try {
      const blob = await work((next) => {
        const elapsed = (performance.now() - started) / 1000;
        const remaining =
          next.stage === "working" && next.value > 0.03 && elapsed > 3 ? (elapsed / next.value) * (1 - next.value) : null;
        setProgress({ ...next, remaining });
      }, controller.signal);
      setResult({ blob, url: URL.createObjectURL(blob), name });
    } catch (problem) {
      if (problem instanceof engine.VideoToolCanceled) setNotice("Cancelled. No file was made.");
      else setError(problem instanceof engine.VideoToolError ? problem.message : "Something went wrong. Please try again.");
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  }

  return {
    loaded, opening, progress, result, error, notice, busy,
    open, close, changed, run,
    cancel: () => abortRef.current?.abort(),
  };
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export const baseName = (name: string) => name.replace(/\.[^.]+$/, "");
