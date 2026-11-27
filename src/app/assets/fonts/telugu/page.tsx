import type { Metadata } from "next";

import { FontGallery } from "@/components/assets/FontGallery";
import { fonts } from "@/lib/fonts";
import { createSocialMetadata } from "@/lib/metadata";

const telugu = fonts.filter((f) => f.scripts.includes("telugu"));
const title = "Telugu Fonts Free Download";
const description = `Download ${telugu.length} free Unicode Telugu fonts for Photoshop, Word, Canva and video editing: NTR, Mandali, Ramabhadra, Gurajada, Suranna and more. Free for personal and commercial use.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets/fonts/telugu" }) };

export default function TeluguFontsPage() {
  return <FontGallery items={telugu} title={title} intro={description} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Fonts", href: "/assets/fonts" }, { label: "Telugu" }]} />;
}
