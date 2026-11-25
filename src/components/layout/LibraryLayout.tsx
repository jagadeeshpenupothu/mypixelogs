import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";

/** The page frame: one centred column, so the content always lines up with the header. */
export function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      {children}
      <Footer />
    </div>
  );
}
