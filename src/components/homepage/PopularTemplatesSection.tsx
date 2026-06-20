import { TemplateCard } from "@/components/cards/TemplateCard";
import { templates } from "@/data/templates";

export function PopularTemplatesSection() {
  const popularTemplates = [...templates].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Popular templates
          </p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Downloaded by teams and creators
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            High-demand document templates for resumes, invoices, receipts,
            certificates, and official business communication.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
