"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Article, Category } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/utils";

const CATEGORIES: Category[] = [
  "World", "Europe", "Politics", "Business", "Technology",
  "Science", "Culture", "Sports", "Crypto", "Opinion",
];

function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10); // YYYY-MM-DD
}

export function ArchiveBrowser({
  articles,
  sources,
}: {
  articles: Article[];
  sources: string[];
}) {
  const t = useTranslations("archive");
  const tcat = useTranslations("categories");
  const locale = useLocale();

  const [date, setDate] = useState<string>("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [source, setSource] = useState<string>("all");

  // Dates present in the archive, newest first, with counts.
  const dates = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      const k = dateKey(a.publishedAt);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [articles]);

  const results = useMemo(() => {
    return articles
      .filter((a) => (date === "all" ? true : dateKey(a.publishedAt) === date))
      .filter((a) => (cat === "all" ? true : a.category === cat))
      .filter((a) => (source === "all" ? true : a.source === source))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [articles, date, cat, source]);

  const fmtDate = (k: string) =>
    new Date(k).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="py-6">
      <div className="mb-6 border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          {t("title")}
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Date rail */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {t("byDate")}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[60vh] lg:flex-col lg:overflow-y-auto lg:pb-0 [scrollbar-width:thin]">
            <button
              type="button"
              onClick={() => setDate("all")}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                date === "all"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-surface-muted"
              )}
            >
              {t("allDates")}
            </button>
            {dates.map(([k, n]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDate(k)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  date === k
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:bg-surface-muted"
                )}
              >
                <span suppressHydrationWarning className="whitespace-nowrap">
                  {fmtDate(k)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[11px] tabular",
                    date === k ? "bg-black/20" : "bg-surface-muted text-muted-foreground"
                  )}
                >
                  {n}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Results */}
        <div>
          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-border pb-5 text-sm">
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{t("category")}</span>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as Category | "all")}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="all">{t("all")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {tcat(c)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{t("source")}</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="all">{t("all")}</option>
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <span className="ml-auto text-muted-foreground">
              {t("count", { count: results.length })}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
              <p className="font-medium">{t("empty")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
