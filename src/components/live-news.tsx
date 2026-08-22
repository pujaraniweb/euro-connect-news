"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { timeAgo } from "@/lib/utils";
import { CategoryPill } from "@/components/category-pill";
import type { Category } from "@/lib/types";

interface LiveItem {
  id: string;
  slug: string;
  category: Category;
  title: string;
  titleHi: string;
  excerpt: string;
  excerptHi: string;
  publishedAt: string;
}

const POLL_MS = 45_000;

export function LiveNews() {
  const t = useTranslations("live");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [items, setItems] = useState<LiveItem[]>([]);
  const [ready, setReady] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const seen = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: LiveItem[] };
      const incoming = data.items ?? [];

      if (firstLoad.current) {
        // Initial items are the latest available — NOT flagged as brand-new.
        incoming.forEach((i) => seen.current.add(i.id));
        firstLoad.current = false;
      } else {
        // Only genuinely newly-received items get the NEW flag.
        const fresh = incoming.filter((i) => !seen.current.has(i.id));
        if (fresh.length) {
          setNewIds((prev) => {
            const next = new Set(prev);
            fresh.forEach((i) => next.add(i.id));
            return next;
          });
        }
        incoming.forEach((i) => seen.current.add(i.id));
      }
      setItems(incoming);
      setCheckedAt(new Date());
      setReady(true);
    } catch {
      setReady(true); // show the empty/waiting state rather than a blank page
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    // Refresh immediately when the tab regains focus.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="py-6">
      {/* Header row: LIVE indicator + Back to News */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" suppressHydrationWarning />
            {checkedAt
              ? t("updated", { time: checkedAt.toLocaleTimeString() })
              : t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToNews")}
        </button>
      </div>

      {/* Waiting state — never fabricates live news */}
      {ready && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <span className="mb-3 flex h-3 w-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
          </span>
          <p className="font-semibold uppercase tracking-wide">{t("title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("waiting")}</p>
        </div>
      )}

      {/* Live timeline — newest first, each opens its internal article */}
      {items.length > 0 && (
        <ol className="relative space-y-1 border-l border-border">
          {items.map((it) => {
            const isNew = newIds.has(it.id);
            const title = locale === "hi" ? it.titleHi : it.title;
            return (
              <li key={it.id} className="relative pl-6">
                <span className="absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent" />
                <Link
                  href={`/article/${it.slug}`}
                  className="group block rounded-lg px-3 py-3 transition-colors hover:bg-surface-muted"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <CategoryPill category={it.category} />
                    {isNew && (
                      <span className="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                        {t("new")}
                      </span>
                    )}
                    <span
                      suppressHydrationWarning
                      className="text-[11px] text-muted-foreground"
                    >
                      {tc("live")} · {timeAgo(it.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold leading-snug transition-colors group-hover:text-accent">
                    {title}
                  </h3>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
