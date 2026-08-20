"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/article-card";

const PAGE = 9;

export function ArticleGrid({
  articles,
  initial = PAGE,
}: {
  articles: Article[];
  initial?: number;
}) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(initial);
  const shown = articles.slice(0, visible);

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
        <p className="font-medium">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptySub")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      {visible < articles.length && (
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
  );
}
