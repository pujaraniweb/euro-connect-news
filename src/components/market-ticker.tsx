"use client";

import { cn } from "@/lib/utils";
import { useLiveMarkets } from "@/lib/use-live-markets";

export function MarketTicker() {
  const { markets } = useLiveMarkets();
  return (
    <div className="flex items-center gap-4 overflow-x-auto text-xs tabular [scrollbar-width:none]">
      {markets.map((m) => {
        const up = m.changePct >= 0;
        return (
          <div key={m.symbol} className="flex shrink-0 items-center gap-1.5">
            <span className="font-medium text-muted-foreground">{m.symbol}</span>
            <span className="font-semibold">
              {m.currency ?? ""}
              {m.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
            <span className={cn("font-medium", up ? "text-up" : "text-down")}>
              {up ? "▲" : "▼"} {Math.abs(m.changePct).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
