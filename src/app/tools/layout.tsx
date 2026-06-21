import type { ReactNode } from "react";

import { RelatedToolsByPath } from "@/components/tools/RelatedToolsByPath";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <RelatedToolsByPath />
    </>
  );
}
