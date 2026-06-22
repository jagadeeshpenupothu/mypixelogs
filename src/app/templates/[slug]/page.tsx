import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/collections/CollectionPage";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { RelatedTemplates } from "@/components/templates/RelatedTemplates";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { TemplateHero } from "@/components/templates/TemplateHero";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { getTemplateCategory } from "@/data/template-categories";
import { createSocialMetadata } from "@/lib/metadata";
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
    const socialTitle = `${template.title} | MyPixelogs`;

    return {
      title,
      description,
      ...createSocialMetadata({
        title: socialTitle,
        description,
        path: url,
        image: template.previewImage,
        imageAlt: `${template.title} preview`,
      }),
    };
  }

  if (category) {
    return {
      title: category.title,
      description: category.description,
      ...createSocialMetadata({
        title: `${category.title} | MyPixelogs`,
        description: category.description,
        path: `/templates/${category.slug}`,
      }),
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
      <section className="bg-white py-1 sm:py-2 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CollectionPage
            kind="template"
            title={category.label}
            items={categoryTemplates}
            searchPlaceholder={`Search ${category.label.toLowerCase()}...`}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Templates", href: "/templates" },
              { label: category.label },
            ]}
          />
        </div>
      </section>
    );

  }

  if (!template) {
    notFound();
  }

  const categoryLabel = getTemplateCategoryLabel(template.category);
  const relatedTemplates = getRelatedTemplates(template, 4);

  return (
    <>
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
