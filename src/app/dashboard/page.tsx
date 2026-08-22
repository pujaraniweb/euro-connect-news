import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { articles, localize } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import { LiveMarketGrid } from "@/components/live-market-grid";
import { CategoryPill } from "@/components/category-pill";

export const metadata: Metadata = {
  title: "Live Dashboard",
  description:
    "Real-time India–Europe markets and breaking headlines — Sensex, Nifty, EUR/INR, Gold, Bitcoin.",
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const liveFeed = articles
    .filter((a) => a.isBreaking || a.isLive)
    .concat(articles)
    .slice(0, 6);

  return (
    <div className="py-6">
      <div className="mb-6 border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          {t("kicker")}
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveMarketGrid />
        </div>

        {/* Live headlines timeline */}
        <aside>
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold">
            <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
            {t("liveUpdates")}
          </h2>
          <ol className="relative space-y-5 border-l border-border pl-5">
            {liveFeed.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
                <div
                  suppressHydrationWarning
                  className="text-[11px] text-muted-foreground"
                >
                  {timeAgo(a.publishedAt)} · {a.source}
                </div>
                <Link href={`/article/${a.slug}`} className="group">
                  <h3 className="mt-0.5 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-accent">
                    {localize(a, locale).title}
                  </h3>
                </Link>
                <div className="mt-1">
                  <CategoryPill category={a.category} />
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
