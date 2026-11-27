import { chatGptPrompts, type ChatGptPrompt } from "@/data/chatgpt-prompts";

export { chatGptPrompts, PROMPT_CATEGORIES, type ChatGptPrompt } from "@/data/chatgpt-prompts";

export type Blank = { label: string; example: string };

const BLANK = /\[([^\]:\n]+?)(?::\s*([^\]\n]+))?\]/g;

/** The fill-in boxes of a prompt, in order, each label once. */
export function blanksOf(prompt: string): Blank[] {
  const seen = new Map<string, Blank>();
  for (const m of prompt.matchAll(BLANK)) {
    const label = m[1].trim();
    if (!seen.has(label) && m[2]) seen.set(label, { label, example: m[2].trim() });
  }
  return [...seen.values()];
}

/** The prompt with typed values in place; empty boxes stay as [Label]. */
export function fillPrompt(prompt: string, values: Record<string, string>) {
  return prompt.replace(BLANK, (whole, label: string, example?: string) => {
    if (!example) return whole;
    const v = values[label.trim()]?.trim();
    return v ? v : `[${label.trim()}]`;
  });
}

export const chatGptUrl = (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;

export const getPromptBySlug = (slug: string) => chatGptPrompts.find((p) => p.slug === slug);

export const relatedPrompts = (p: ChatGptPrompt, limit = 6) => chatGptPrompts.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, limit);
