import Link from "next/link";
import { Linkedin, Twitter, Youtube } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/tools", label: "Tools" },
      { href: "/resources", label: "Resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-50 dark:bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm text-white">
              mp
            </span>
            MyPixelogs
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Free templates, PDF tools, and design resources for business teams,
            creators, and independent professionals.
          </p>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            <Link href="#" aria-label="Twitter" className="transition hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="LinkedIn" className="transition hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="YouTube" className="transition hover:text-primary">
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Copyright {new Date().getFullYear()} MyPixelogs. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/disclaimer" className="hover:text-primary">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
