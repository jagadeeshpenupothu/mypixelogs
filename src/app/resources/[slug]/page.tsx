import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { ResourceCard } from "@/components/cards/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { createSocialMetadata } from "@/lib/metadata";
import {
  getRelatedResources,
  getResourceFiles,
  getResourceBySlug,
  getResourceRouteSlugs,
} from "@/lib/resources";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getResourceRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    return {};
  }

  const title = resource.title;
  const socialTitle = `${resource.title} | mypixelogs`;
  const url = `/resources/${resource.slug}`;

  return {
    title,
    description: resource.description,
    ...createSocialMetadata({
      title: socialTitle,
      description: resource.description,
      path: url,
      image: resource.previewImage,
      imageAlt: `${resource.title} preview`,
    }),
  };
}

export default async function ResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const relatedResources = getRelatedResources(resource);
  const resourceFiles = getResourceFiles(resource);
  const resourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: resource.title,
    description: resource.description,
    category: resource.category,
    url: `${siteConfig.url}/resources/${resource.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resourceJsonLd) }}
      />
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {resource.category}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
                {resource.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {resource.description}
              </p>

              <div className="mt-10 overflow-hidden rounded-lg border border-border bg-slate-50 p-4 shadow-sm sm:p-6">
                <Image
                  src={resource.previewImage}
                  alt={`${resource.title} preview`}
                  width={1200}
                  height={850}
                  className="h-auto w-full rounded-lg border border-border bg-white object-cover"
                  priority
                />
              </div>
            </div>

            <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Available downloads</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Static file-based download. Replace the placeholder file in
                `public/resources` when the final asset is ready.
              </p>
              <div className="mt-5 grid gap-3">
                {resourceFiles.map((file) => (
                  <div
                    key={`${file.type}-${file.url}`}
                    className="rounded-lg border border-border bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="secondary" className="bg-blue-50 text-primary">
                          {file.type}
                        </Badge>
                        <p className="mt-3 text-sm font-semibold text-foreground">
                          {file.label}
                        </p>
                      </div>
                      <Button asChild size="sm">
                        <a href={file.url} download>
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {relatedResources.length > 0 ? (
            <section className="mt-14 border-t border-border pt-12">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Related resources
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">
                More files like this
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedResources.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}
