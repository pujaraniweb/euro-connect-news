"use client";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLiveMarkets } from "@/lib/use-live-markets";

export function LiveMarketGrid() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { markets: quotes, updatedAt, refresh } = useLiveMarkets();
  const shownTime = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("en-GB")
    : "—";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-up pulse-dot" />
          {t("liveUpdated", { time: shownTime })}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {tc("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quotes.map((m) => {
          const up = m.changePct >= 0;
          return (
            <div
              key={m.symbol}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm font-bold">{m.symbol}</div>
                  <div className="text-xs text-muted-foreground">{m.name}</div>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold tabular",
                    up ? "text-up" : "text-down"
                  )}
                >
                  {up ? "▲" : "▼"} {Math.abs(m.changePct).toFixed(2)}%
                </span>
              </div>
              <div className="mt-3 font-serif text-3xl font-bold tabular">
                {m.currency ?? ""}
                {m.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div
                className={cn(
                  "mt-1 text-sm tabular",
                  up ? "text-up" : "text-down"
                )}
              >
                {up ? "+" : ""}
                {m.change.toLocaleString("en-IN", { maximumFractionDigits: 2 })}{" "}
                {t("todaySuffix")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
