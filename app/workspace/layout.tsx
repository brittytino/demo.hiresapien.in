"use client";

import type { ReactNode } from "react";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ws-body" style={{ display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
