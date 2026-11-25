import type { ReactNode } from "react";

import { LibraryLayout } from "@/components/layout/LibraryLayout";
import { RelatedToolsByPath } from "@/components/tools/RelatedToolsByPath";
import { ToolGuideByPath } from "@/components/tools/ToolGuideByPath";
import { ToolTrail } from "@/components/tools/ToolTrail";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <LibraryLayout>
      <ToolTrail />
      {children}
      <ToolGuideByPath />
      <RelatedToolsByPath />
    </LibraryLayout>
  );
}
