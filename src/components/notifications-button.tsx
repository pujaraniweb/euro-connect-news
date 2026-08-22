"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { articles, localize } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";

/** Bell that opens a dropdown of the latest headlines (each links to its article). */
export function NotificationsButton() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const latest = articles.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        type="button"
        aria-label={t("notifications")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-[70] w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          <div className="border-b border-border px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t("latestHeadlines")}
          </div>
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {latest.map((a) => {
              const { title } = localize(a, locale);
              return (
                <li key={a.id}>
                  <Link
                    href={`/article/${a.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-surface-muted"
                  >
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {title}
                    </p>
                    <span
                      suppressHydrationWarning
                      className="mt-1 block text-[11px] text-muted-foreground"
                    >
                      {a.source} · {timeAgo(a.publishedAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-accent hover:bg-surface-muted"
          >
            {t("seeAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
