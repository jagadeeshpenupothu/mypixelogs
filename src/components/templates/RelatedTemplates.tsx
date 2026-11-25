import { TemplateCard } from "@/components/cards/TemplateCard";
import type { Template } from "@/types/template";

type RelatedTemplatesProps = {
  templates: Template[];
};

export function RelatedTemplates({ templates }: RelatedTemplatesProps) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border pt-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-foreground">More like this</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
