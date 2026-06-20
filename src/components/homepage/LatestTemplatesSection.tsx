import { TemplateCard } from "@/components/cards/TemplateCard";
import { templates } from "@/data/templates";

export function LatestTemplatesSection() {
  const latestTemplates = templates.slice(-6).reverse();

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Latest templates
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">Fresh files to move faster</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}
