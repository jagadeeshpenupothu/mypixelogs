import { ToolCard } from "@/components/cards/ToolCard";
import { tools } from "@/data/tools";

export function ToolsSection() {
  return (
    <section className="border-y border-border bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">PDF tools</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">Simple tools for everyday files</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Built as a future-ready surface for PDF processing without adding backend
            complexity to this foundation.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
