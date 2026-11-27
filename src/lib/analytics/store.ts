import "server-only";

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** A tiny key/value store: Netlify Blobs on the live site, a local folder in development. */
type Store = {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
  list(prefix: string): Promise<string[]>;
};

const LOCAL_DIR = path.join(process.cwd(), ".data", "analytics");

const localStore: Store = {
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
    const dir = path.join(LOCAL_DIR, prefix);
    try {
      return (await readdir(dir)).map((f) => `${prefix}${f}`);
    } catch {
      return [];
    }
  },
};

let cached: Store | null = null;

export async function analyticsStore(): Promise<Store> {
  if (cached) return cached;
  try {
    const { getStore } = await import("@netlify/blobs");
    const blobs = getStore({ name: "analytics", consistency: "strong" });
    // Throws outside Netlify, where no Blobs context exists.
    await blobs.list({ prefix: "ping/" });
    cached = {
      get: (key) => blobs.get(key, { type: "json" }),
      set: async (key, value) => {
        await blobs.setJSON(key, value);
      },
      list: async (prefix) => (await blobs.list({ prefix })).blobs.map((b) => b.key),
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
