import Link from "next/link";

const links = [
  { href: "/tools", label: "All tools" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function Footer() {
  return (
    <footer className="mt-16 flex flex-col gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} MyPixelogs</p>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link prefetch={false} href={link.href} className="inline-block py-1.5 transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
