import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";

type SocialMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
};

export const defaultOpenGraphImage = {
  url: siteConfig.ogImage,
  width: 1200,
  height: 630,
  alt: "MyPixelogs - Free PDF tools, templates, calculators and assets",
};

export function getAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function createSocialMetadata({
  title,
  description,
  path,
  image = siteConfig.ogImage,
  imageAlt = defaultOpenGraphImage.alt,
}: SocialMetadataInput): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  const url = getAbsoluteUrl(path);
  const imageUrl = getAbsoluteUrl(image);

  return {
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/** Search engines show about 155 characters; cut longer text at a word and add an ellipsis. */
export function metaDescription(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\-–—]+$/, "")}…`;
}
