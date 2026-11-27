import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";

/** The page frame: one centred column, so the content always lines up with the header.
 * `wide` uses the whole screen width, for galleries that fill it with columns. */
export function LibraryLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`${wide ? "w-full" : "mx-auto max-w-7xl"} px-4 py-5 sm:px-6 lg:px-8 lg:py-8`}>
      {children}
      <Footer />
    </div>
  );
}
