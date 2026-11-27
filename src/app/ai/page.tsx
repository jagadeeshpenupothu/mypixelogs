import type { Metadata } from "next";

import { PromptGallery } from "@/components/prompts/PromptGallery";
import { chatGptPrompts, PROMPT_CATEGORIES } from "@/lib/prompts";
import { createSocialMetadata } from "@/lib/metadata";

const title = "ChatGPT Prompts to Write Emails";
const description = `${chatGptPrompts.length} free ChatGPT prompts to write emails: job applications, leave requests, payment reminders, complaints and more. Fill in, then copy.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/ai" }) };

export default function AiPromptsPage() {
  return <PromptGallery items={chatGptPrompts} categories={PROMPT_CATEGORIES} title={title} intro={description} />;
}
