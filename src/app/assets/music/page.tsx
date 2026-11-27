import type { Metadata } from "next";

import { AudioLibrary } from "@/components/assets/AudioLibrary";
import { musicItems } from "@/lib/audio-library";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Background Music for Videos";
const description = `${musicItems.length} free background music tracks for YouTube, Instagram Reels and video editing: happy, calm, epic, suspense, funny and groovy. Royalty-free music by Kevin MacLeod (CC BY 4.0).`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets/music" }) };

export default function MusicPage() {
  return (
    <AudioLibrary
      items={musicItems}
      title={title}
      intro={description}
      groupLabel="Mood"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Background music" }]}
      note={
        <>
          Free for YouTube, reels and client videos, including monetised ones. Music by Kevin MacLeod under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" className="text-primary hover:underline">CC BY 4.0</a>: put the credit line in your video description (copy it with the copy button). Press play for a 30-second preview; Download saves the full track (MP3).
        </>
      }
    />
  );
}
