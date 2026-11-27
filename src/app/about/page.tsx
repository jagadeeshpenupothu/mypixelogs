import type { Metadata } from "next";
import Link from "next/link";

import { templates } from "@/data/templates";
import { tools } from "@/data/tools";
import { music, sfx } from "@/lib/audio-library";
import { fonts } from "@/lib/fonts";
import { createSocialMetadata } from "@/lib/metadata";
import { chatGptPrompts } from "@/lib/prompts";

const description =
  "MyPixelogs offers free online tools for videos, photos and PDFs, ready-made templates, fonts, music and ChatGPT prompts. No sign-up, and files stay on your device.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...createSocialMetadata({ title: "About MyPixelogs", description, path: "/about" }),
};

const link = "font-semibold text-primary hover:underline";

export default function AboutPage() {
  const liveTools = tools.filter((t) => !t.comingSoon).length;
  const telugu = fonts.filter((f) => f.scripts.includes("telugu")).length;
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 2xl:px-14">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">About MyPixelogs</h1>
        <div className="mt-5 space-y-5 text-base leading-7 text-muted-foreground">
          <p>
            MyPixelogs is a free website for everyday work with files and documents. It started with a simple idea: the small jobs people
            do every day — making a video smaller for WhatsApp, joining PDFs, writing a leave letter, making an invoice — should be quick,
            free and private.
          </p>

          <h2 className="pt-2 text-xl font-semibold text-foreground">What you&apos;ll find here</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <Link prefetch={false} href="/tools" className={link}>{liveTools} online tools</Link> for videos, photos, PDFs, QR codes and calculators (EMI,
              GST, SIP and more).
            </li>
            <li>
              <Link prefetch={false} href="/templates" className={link}>{templates.length} templates</Link>: invoices, quotations, resumes, letters, certificates,
              salary slips, flyers and more, ready for Word, Google Docs, Excel, Canva and Photoshop.
            </li>
            <li>
              <Link prefetch={false} href="/assets/fonts" className={link}>{fonts.length} free fonts</Link>, including {telugu} Telugu fonts,{" "}
              <Link prefetch={false} href="/assets/music" className={link}>{music.length} background music tracks</Link> and{" "}
              <Link prefetch={false} href="/assets/sound-effects" className={link}>{sfx.length} sound effects</Link> for video editing.
            </li>
            <li>
              <Link prefetch={false} href="/ai" className={link}>{chatGptPrompts.length} ChatGPT prompts</Link> for writing emails, with boxes to fill in your details.
            </li>
          </ul>

          <h2 className="pt-2 text-xl font-semibold text-foreground">How we make our content</h2>
          <p>
            Every template is researched against real documents in use in India and abroad, then designed and checked so it fits on one page
            and opens correctly in each app. New templates are added regularly. Fonts come from Google Fonts, music from composer Kevin MacLeod
            and sound effects from Kenney, each under licences that allow free use; the licence is shown on each page.
          </p>

          <h2 className="pt-2 text-xl font-semibold text-foreground">Your privacy</h2>
          <p>
            There is no sign-up and nothing to install. Our tools run inside your browser, so your videos, photos and documents stay on your
            own phone or computer. Read our <Link prefetch={false} href="/privacy-policy" className={link}>privacy policy</Link> for details.
          </p>

          <h2 className="pt-2 text-xl font-semibold text-foreground">Get in touch</h2>
          <p>
            Want a template or tool we don&apos;t have, or found something that isn&apos;t working?{" "}
            <Link prefetch={false} href="/contact" className={link}>Send us a message</Link>. Popular requests get built first.
          </p>
        </div>
      </div>
    </section>
  );
}
