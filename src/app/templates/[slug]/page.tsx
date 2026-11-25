import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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
  isHiddenTemplate,
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
    if (categoryTemplates.length === 0) redirect("/templates");

    return (
      <section className="pb-2">
        <div className="mx-auto max-w-7xl">
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
    if (isHiddenTemplate(slug)) redirect("/templates");
    notFound();
  }

  const categoryLabel = getTemplateCategoryLabel(template.category);
  const relatedTemplates = getRelatedTemplates(template, 4);

  return (
    <>
      <section className="pb-2">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Templates", href: "/templates" },
              { label: categoryLabel, href: `/templates/${template.category}` },
              { label: template.title },
            ]}
          />

          <div className="mt-5">
            <TemplateHero template={template} categoryLabel={categoryLabel} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="lg:order-2 lg:sticky lg:top-20">
              <TemplateActions template={template} />
            </div>
            <TemplatePreview template={template} />
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
                {template.previewVideo
                  ? "Make a video invitation without any editing software."
                  : "Use this file as a fast starting point for common business and document workflows."}
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
