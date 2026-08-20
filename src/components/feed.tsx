"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/utils";

const TABS = [
  "All",
  "World",
  "Europe",
  "Business",
  "Technology",
  "Sports",
] as const;

type Tab = (typeof TABS)[number];

const PAGE = 6;

export function Feed({ articles }: { articles: Article[] }) {
  const t = useTranslations("common");
  const th = useTranslations("home");
  const tt = useTranslations("home.tabs");
  const tcat = useTranslations("categories");
  const [tab, setTab] = useState<Tab>("All");
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    if (tab === "All") return articles;
    return articles.filter((a) => a.category === tab);
  }, [articles, tab]);

  const shown = filtered.slice(0, visible);

  return (
    <section id="feed" className="scroll-mt-40 py-6">
      <h2 className="mb-3 font-serif text-xl font-bold tracking-tight">
        {th("latestNews")}
      </h2>
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              onClick={() => {
                setTab(tabName);
                setVisible(PAGE);
              }}
              className={cn(
                "relative whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors",
                tab === tabName
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tabName === "All" ? tt("All") : tcat(tabName)}
              {tab === tabName && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {visible < filtered.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EmptyState() {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-surface-muted text-muted-foreground">
        <RefreshCw className="h-6 w-6" />
      </div>
      <p className="font-medium">{t("emptyTitle")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("emptySub")}</p>
    </div>
  );
}
