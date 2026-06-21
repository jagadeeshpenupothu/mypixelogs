import { templates } from "@/data/templates";
import { tools } from "@/data/tools";

export function StatsSection() {
  const calculatorTools = tools.filter((tool) => tool.category === "Calculator Tools");
  const liveTools = tools.filter((tool) => !tool.comingSoon);

  const stats = [
    { value: `${liveTools.length.toLocaleString()}+`, label: "Tools" },
    { value: `${calculatorTools.length.toLocaleString()}+`, label: "Calculators" },
    { value: `${templates.length.toLocaleString()}+`, label: "Templates" },
    { value: "100%", label: "Free" },
  ];

  return (
    <section className="border-b border-border bg-white py-8 dark:bg-black">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-3xl font-bold tracking-normal text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
