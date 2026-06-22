import type { ReactNode } from "react";

import { ExplorerLayout } from "@/components/explorer/ExplorerLayout";
import { RelatedToolsByPath } from "@/components/tools/RelatedToolsByPath";
import { getExplorerGroups } from "@/lib/explorer";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  const explorerGroups = getExplorerGroups();

  return (
    <ExplorerLayout groups={explorerGroups}>
      {children}
      <RelatedToolsByPath />
    </ExplorerLayout>
  );
}
