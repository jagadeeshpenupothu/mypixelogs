import Link from "next/link";

import { mainNav } from "@/data/navigation";

const groups = [
  { title: "Make and edit", links: mainNav },
  { title: "More", links: [{ href: "/tools", label: "All tools" }, { href: "/assets", label: "Design files" }] },
  {
    title: "MyPixelogs",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border py-8 text-sm text-muted-foreground">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="font-semibold text-foreground">{group.title}</p>
            <ul className="mt-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-block py-1.5 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mt-8">© {new Date().getFullYear()} MyPixelogs. Free to use, no sign-up.</p>
    </footer>
  );
}
