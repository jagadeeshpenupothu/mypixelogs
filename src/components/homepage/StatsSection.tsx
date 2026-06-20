import { resources } from "@/data/resources";
import { templates } from "@/data/templates";
import { tools } from "@/data/tools";

export function StatsSection() {
  const totalDownloads = templates.reduce((total, template) => total + template.downloads, 0);

  const stats = [
    { value: templates.length.toLocaleString(), label: "Templates Available" },
    { value: resources.length.toLocaleString(), label: "Resources Available" },
    { value: tools.length.toLocaleString(), label: "Tools Available" },
    { value: `${totalDownloads.toLocaleString()}+`, label: "Downloads" },
  ];

  return (
    <section className="bg-primary py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/20 p-6">
            <p className="text-4xl font-bold tracking-normal">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-blue-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
