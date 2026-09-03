"use client";

import { ReactNode, useMemo } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(
    () => new ConvexReactClient(url ?? "https://placeholder.convex.cloud"),
    [],
  );

  return (
    <ConvexProvider client={client}>
      {!url && (
        <div className="fixed bottom-3 left-3 z-50 max-w-xs rounded-lg border border-hair-2 bg-card px-3 py-2 text-xs text-muted shadow-lg">
          <b className="text-ink">Convex not connected.</b> Set{" "}
          <code>NEXT_PUBLIC_CONVEX_URL</code> in <code>.env.local</code> and run{" "}
          <code>npx convex dev</code>. See <code>web/README.md</code>.
        </div>
      )}
      {children}
    </ConvexProvider>
  );
}
