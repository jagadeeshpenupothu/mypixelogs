import Link from "next/link";

const links = [
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/ai", label: "AI Hub" },
  { href: "/resources", label: "Resources" },
  { href: "/assets", label: "Assets" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border py-3 text-xs text-muted-foreground">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>© {new Date().getFullYear()} MyPixelogs</span>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-[11px] text-muted-foreground/80">Built for creators & businesses</p>
      </div>
    </footer>
  );
}
