import type { Metadata } from "next";

import { AudioLibrary } from "@/components/assets/AudioLibrary";
import { SFX_ZIP, sfxItems } from "@/lib/audio-library";
import { createSocialMetadata } from "@/lib/metadata";

const title = "Free Sound Effects for Video Editing";
const description = `${sfxItems.length} free sound effects for video editing: clicks, swooshes, notifications, punches and impacts, footsteps, sci-fi and short jingles. MP3, CC0, no credit needed.`;

export const metadata: Metadata = { title, description, ...createSocialMetadata({ title, description, path: "/assets/sound-effects" }) };

export default function SoundEffectsPage() {
  return (
    <AudioLibrary
      items={sfxItems}
      title={title}
      intro={description}
      groupLabel="Type"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Assets", href: "/assets" }, { label: "Sound effects" }]}
      note={
        <>
          Free for any video, including commercial work. No credit needed (CC0, sounds by Kenney). Press play to listen, or{" "}
          <a href={SFX_ZIP} download className="font-semibold text-primary hover:underline">download all 100 as one zip (1.1 MB)</a>.
        </>
      }
    />
  );
}
