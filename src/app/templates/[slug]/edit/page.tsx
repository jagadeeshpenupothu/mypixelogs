import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import { templates } from "@/data/templates";
import { createSocialMetadata } from "@/lib/metadata";
import { getTemplateBySlug } from "@/lib/templates";
import "./invoice-editor.css";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return templates.filter((template) => template.editor).map(({ slug }) => ({ slug }));
}

const pageTitle = (title: string) => `Edit ${title} Online`;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template?.editor) return {};
  const title = pageTitle(template.title);
  const description = `Fill in the ${template.title.toLowerCase()} in your browser with automatic totals, then download it as Word or PDF for free.`;
  return { title, description, ...createSocialMetadata({ title: `${title} | MyPixelogs`, description, path: `/templates/${slug}/edit`, image: template.previewImage }) };
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);
  if (!template?.editor) notFound();

  return (
    <section className="pb-2">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Templates", href: "/templates" }, { label: template.title, href: `/templates/${slug}` }, { label: "Edit online" }]} />
        <div className="mt-6"><InvoiceEditor key={slug} kind={template.editor} title={pageTitle(template.title)} /></div>
      </div>
    </section>
  );
}
