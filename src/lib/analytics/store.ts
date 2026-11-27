import "server-only";

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** A tiny key/value store: Netlify Blobs on the live site, a local folder in development. */
type Store = {
  kind?: string;
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
  list(prefix: string): Promise<string[]>;
};

const LOCAL_DIR = path.join(process.cwd(), ".data", "analytics");

const localStore: Store = {
  kind: "local",
  async get(key) {
    try {
      return JSON.parse(await readFile(path.join(LOCAL_DIR, key), "utf8"));
    } catch {
      return null;
    }
  },
  async set(key, value) {
    const file = path.join(LOCAL_DIR, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(value));
  },
  async list(prefix) {
    // Like Netlify Blobs: every key (file) that starts with the prefix, in all folders below.
    try {
      const files = (await readdir(LOCAL_DIR, { recursive: true, withFileTypes: true })).filter((f) => f.isFile());
      return files.map((f) => path.relative(LOCAL_DIR, path.join(f.parentPath, f.name)).split(path.sep).join("/")).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

let cached: Store | null = null;

/** Never let a slow storage call hang a page: give up after 8 seconds and use the fallback. */
function limit<T>(work: Promise<T>, fallback: T, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.error(`[analytics] storage timed out: ${what}`);
      resolve(fallback);
    }, 8000);
  });
  // Cancel the timer as soon as the work is done, so nothing keeps the server busy.
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

export async function analyticsStore(): Promise<Store> {
  if (cached) return cached;
  // On Netlify the Blobs context is provided through the environment; anywhere else use the local folder.
  const g = globalThis as { netlifyBlobsContext?: unknown };
  const onNetlify = Boolean(process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || g.netlifyBlobsContext);
  if (!onNetlify) {
    cached = localStore;
    return cached;
  }
  try {
    const { getStore } = await import("@netlify/blobs");
    const blobs = getStore({ name: "analytics" });
    const timed = async <T,>(what: string, work: Promise<T>, fallback: T) => {
      const t0 = Date.now();
      const out = await limit(work, fallback, what);
      const ms = Date.now() - t0;
      if (ms > 700) console.warn(`[analytics] slow storage ${what}: ${ms} ms`);
      return out;
    };
    cached = {
      kind: "netlify-blobs",
      get: (key) => timed(`get ${key}`, blobs.get(key, { type: "json" }), null),
      set: async (key, value) => {
        await timed(`set ${key}`, blobs.setJSON(key, value), undefined);
      },
      list: (prefix) => timed(`list ${prefix}`, blobs.list({ prefix }).then((r) => r.blobs.map((b) => b.key)), [] as string[]),
    };
  } catch {
    cached = localStore;
  }
  return cached;
}

/** Day keys in Indian time, e.g. "2026-11-28". */
export function dayKey(ms: number) {
  return new Date(ms + 5.5 * 3600_000).toISOString().slice(0, 10);
}
