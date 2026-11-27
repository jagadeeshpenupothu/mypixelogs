import type { ReactNode } from "react";

import { LibraryLayout } from "@/components/layout/LibraryLayout";

/** Templates use the full screen width so the gallery can show as many columns as fit. */
export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <LibraryLayout wide>{children}</LibraryLayout>;
}
