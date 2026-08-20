"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLiveMarkets } from "@/lib/use-live-markets";

export function MarketStrip() {
  const t = useTranslations("home");
  const { markets } = useLiveMarkets();
  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold tracking-tight">
          {t("liveMarkets")}
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-accent"
        >
          {t("fullDashboard")} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {markets.map((m) => {
          const up = m.changePct >= 0;
          return (
            <div
              key={m.symbol}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {m.symbol}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold tabular",
                    up ? "text-up" : "text-down"
                  )}
                >
                  {up ? "▲" : "▼"} {Math.abs(m.changePct).toFixed(2)}%
                </span>
              </div>
              <div className="mt-1 font-serif text-xl font-bold tabular">
                {m.currency ?? ""}
                {m.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-xs tabular",
                  up ? "text-up" : "text-down"
                )}
              >
                {up ? "+" : ""}
                {m.change.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
