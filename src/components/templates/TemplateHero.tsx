import type { Template } from "@/types/template";

type TemplateHeroProps = {
  template: Template;
  /** Kept for callers; the breadcrumb above already names the category. */
  categoryLabel?: string;
};

export function TemplateHero({ template }: TemplateHeroProps) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">{template.title}</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{template.description}</p>
    </header>
  );
}
