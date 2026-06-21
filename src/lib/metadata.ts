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
  alt: "MyPixelogs - Free PDF tools, templates, calculators and resources",
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
