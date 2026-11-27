import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";

/** The page frame: one centred column at the site width, so the content always lines up with the header. */
export function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-site px-4 py-5 sm:px-6 lg:px-10 lg:py-8 2xl:px-14">
      {children}
      <Footer />
    </div>
  );
}
