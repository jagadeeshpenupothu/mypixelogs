import type { Metadata } from "next";

import { FontGallery } from "@/components/assets/FontGallery";
import { fonts } from "@/lib/fonts";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Fonts for Photoshop, Canva and Word";
const description = `Download ${fonts.length} free fonts for commercial use: sans serif, serif, script, display, Telugu and Hindi. For Photoshop, Word and Canva.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets/fonts" }) };

export default function FontsPage() {
  return <FontGallery items={fonts} title={title} intro={description} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Fonts" }]} />;
}
