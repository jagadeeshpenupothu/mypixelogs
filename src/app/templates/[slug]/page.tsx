import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplateCard } from "@/components/cards/TemplateCard";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { RelatedTemplates } from "@/components/templates/RelatedTemplates";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { TemplateHero } from "@/components/templates/TemplateHero";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { getTemplateCategory } from "@/data/template-categories";
import { siteConfig } from "@/constants/site";
import {
  getRelatedTemplates,
  getTemplateBySlug,
  getTemplateCategoryLabel,
  getTemplateRouteSlugs,
  getTemplatesByCategory,
} from "@/lib/templates";
import type { TemplateCategory } from "@/types/template";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getTemplateRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  const category = getTemplateCategory(slug);

  if (template) {
    const title = template.title;
    const description = template.description;
    const url = `/templates/${template.slug}`;
    const socialTitle = `${template.title} | mypixelogs`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: socialTitle,
        description,
        url,
        siteName: siteConfig.name,
        images: [
          {
            url: template.previewImage,
            width: 1200,
            height: 850,
            alt: `${template.title} preview`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: socialTitle,
        description,
        images: [template.previewImage],
      },
    };
  }

  if (category) {
    return {
      title: category.title,
      description: category.description,
      alternates: {
        canonical: `/templates/${category.slug}`,
      },
      openGraph: {
        title: `${category.title} | mypixelogs`,
        description: category.description,
        url: `/templates/${category.slug}`,
        siteName: siteConfig.name,
      },
      twitter: {
        card: "summary_large_image",
        title: `${category.title} | mypixelogs`,
        description: category.description,
      },
    };
  }

  return {};
}

export default async function TemplateDynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  const category = getTemplateCategory(slug);

  if (category) {
    const categoryTemplates = getTemplatesByCategory(category.slug as TemplateCategory);

    return (
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Templates", href: "/templates" },
              { label: category.label },
            ]}
          />

          <header className="mt-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Template category
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
              {category.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {category.description}
            </p>
          </header>

          <div className="mt-10 flex flex-col justify-between gap-4 border-y border-border py-5 sm:flex-row sm:items-center">
            <p className="text-sm font-medium text-muted-foreground">
              Showing {categoryTemplates.length} templates
            </p>
            <p className="text-sm text-muted-foreground">Pagination-ready collection layout</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTemplates.map((item) => (
              <TemplateCard key={item.id} template={item} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!template) {
    notFound();
  }

  const categoryLabel = getTemplateCategoryLabel(template.category);
  const relatedTemplates = getRelatedTemplates(template, 4);
  const templateJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: template.title,
    description: template.description,
    category: categoryLabel,
    url: `${siteConfig.url}/templates/${template.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(templateJsonLd) }}
      />
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Templates", href: "/templates" },
              { label: categoryLabel, href: `/templates/${template.category}` },
              { label: template.title },
            ]}
          />

          <div className="mt-10">
            <TemplateHero template={template} categoryLabel={categoryLabel} />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <TemplatePreview template={template} />
            <TemplateActions template={template} />
          </div>

          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">Template details</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{template.description}</p>
              <h3 className="mt-8 text-lg font-semibold text-foreground">Features</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {template.features.map((feature) => (
                  <li key={feature} className="rounded-md bg-slate-50 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground">Use cases</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Use this file as a fast starting point for common business and
                document workflows.
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {template.useCases.map((useCase) => (
                  <li key={useCase} className="rounded-md bg-slate-50 px-4 py-3">
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="mt-12">
            <RelatedTemplates templates={relatedTemplates} />
          </div>
        </div>
      </section>
    </>
  );
}
