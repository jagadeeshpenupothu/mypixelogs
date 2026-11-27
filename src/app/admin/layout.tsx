import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-site px-4 py-6 sm:px-6 lg:px-10 2xl:px-14">{children}</div>;
}
