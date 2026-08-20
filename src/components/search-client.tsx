"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { getSearchCorpus } from "@/lib/archive";
import type { Category } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";
import { cn } from "@/lib/utils";

const CATEGORIES: (Category | "All")[] = [
  "All",
  "World",
  "Europe",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Culture",
  "Sports",
  "Crypto",
  "Opinion",
];

const TRENDING = ["Europe", "AI", "Bitcoin", "Election", "Climate"];

// Current + archived news, so search covers everything ever collected.
const CORPUS = getSearchCorpus();

export function SearchClient() {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const tcat = useTranslations("categories");
  const ttabs = useTranslations("home.tabs");
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState<Category | "All">("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CORPUS.filter((a) => {
      const matchCat = cat === "All" || a.category === cat;
      if (!matchCat) return false;
      if (!q) return true;
      // Search both languages so results are found regardless of UI language.
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.titleHi.includes(query.trim()) ||
        a.excerptHi.includes(query.trim()) ||
        a.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        a.source.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  return (
    <div className="py-6">
      <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight">
        {t("title")}
      </h1>

      <label className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tc("searchPlaceholder")}
          className="w-full rounded-full border border-border bg-surface py-3.5 pl-12 pr-4 text-base outline-none transition-colors focus:border-accent"
        />
      </label>

      {/* Trending */}
      {!query && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("trending")}</span>
          {TRENDING.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQuery(t)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Category filters */}
      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-border pb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              cat === c
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-surface text-foreground/80 hover:border-accent"
            )}
          >
            {c === "All" ? ttabs("All") : tcat(c)}
          </button>
        ))}
      </div>

      <p className="mb-4 mt-5 text-sm text-muted-foreground">
        {t("resultsFor", {
          count: results.length,
          query: query ? t("forQuery", { query }) : "",
        })}
      </p>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <p className="font-medium">{t("noResultsTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noResultsSub")}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, 48).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
