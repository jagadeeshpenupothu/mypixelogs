const stats = [
  { value: "500+", label: "Templates" },
  { value: "100K+", label: "Downloads" },
  { value: "50+", label: "Categories" },
  { value: "20+", label: "Tools" },
];

export function StatsSection() {
  return (
    <section className="bg-primary py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-white/20 p-6">
            <p className="text-4xl font-bold">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-blue-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
