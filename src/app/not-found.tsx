import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

const quickLinks = [
  { href: "/", label: "Go Home", icon: Home, variant: "default" as const },
  { href: "/templates", label: "Browse Templates", icon: ArrowRight, variant: "outline" as const },
  { href: "/tools", label: "Explore Tools", icon: ArrowRight, variant: "outline" as const },
  { href: "/assets", label: "View Assets", icon: ArrowRight, variant: "outline" as const },
];

export default function NotFound() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            MyPixelogs
          </p>
          <h1 className="mt-4 text-7xl font-bold tracking-normal text-foreground sm:text-8xl">
            404
          </h1>
          <h2 className="mt-5 text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
            Page Not Found
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          <nav
            aria-label="Helpful links"
            className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Button key={link.href} asChild variant={link.variant} className="w-full">
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-border bg-card p-5 text-left shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Search className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Try searching</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Try searching for templates, tools, or assets.
                </p>
                <Link
                  href="/search"
                  className="mt-3 inline-flex rounded-md text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Open search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
