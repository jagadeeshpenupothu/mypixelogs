import { redirect } from "next/navigation";

import { getAssetBySlug } from "@/lib/assets";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ResourceRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);

  if (asset) {
    redirect(`/assets/${slug}`);
  }

  redirect("/templates");
}
