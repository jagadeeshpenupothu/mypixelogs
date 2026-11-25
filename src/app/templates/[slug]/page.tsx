import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { LibraryPage } from "@/components/collections/LibraryPage";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { RelatedTemplates } from "@/components/templates/RelatedTemplates";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { TemplateHero } from "@/components/templates/TemplateHero";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { getTemplateCategory } from "@/data/template-categories";
import { templateGroups, templateSections } from "@/lib/library";
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
      <LibraryPage
        title={category.label}
        intro={category.description}
        noun="templates"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: category.label },
        ]}
        groups={templateGroups(category.slug)}
        sections={templateSections(category.slug)}
      />
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

          {template.features.length > 0 ? (
            <section className="mt-10 max-w-3xl">
              <h2 className="text-xl font-bold text-foreground">What&apos;s included</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base leading-7 text-muted-foreground">
                {template.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-12">
            <RelatedTemplates templates={relatedTemplates} />
          </div>
        </div>
      </section>
    </>
  );
}
