import type { ReactNode } from "react";

import { ExplorerLayout } from "@/components/explorer/ExplorerLayout";
import { getExplorerGroups } from "@/lib/explorer";

export default function AiLayout({ children }: { children: ReactNode }) {
  const explorerGroups = getExplorerGroups();

  return <ExplorerLayout groups={explorerGroups}>{children}</ExplorerLayout>;
}
