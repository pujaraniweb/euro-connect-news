import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { articles, localize } from "@/lib/mock-data";
import { LiveClock } from "@/components/live-clock";

/** Time-only label for a headline, e.g. "11:00 AM". Deterministic (fixed date). */
function tickerTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function BreakingTicker() {
  const t = useTranslations("common");
  const locale = useLocale();

  const source = articles.slice(0, 8).map((a) => ({
    slug: a.slug,
    title: localize(a, locale).title,
    time: tickerTime(a.publishedAt),
  }));
  const items = [...source, ...source];

  return (
    <div className="bg-[#dc2626] text-white">
      <div className="mx-auto flex h-11 max-w-[1400px] items-center gap-3 overflow-hidden px-4 sm:px-6">
        <span className="flex shrink-0 items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {t("breaking")}
        </span>
        <span className="hidden shrink-0 text-white/40 sm:inline">|</span>
        <LiveClock
          withSeconds
          showIcon={false}
          className="hidden shrink-0 text-xs tabular text-white/85 sm:flex"
        />
        <span className="hidden shrink-0 text-white/40 lg:inline">|</span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
            {items.map((it, i) => (
              <Link
                key={i}
                href={`/article/${it.slug}`}
                className="text-sm text-white/95 transition-opacity hover:text-white"
              >
                <span className="font-medium">{it.title}</span>
                <span suppressHydrationWarning className="ml-2 tabular text-white/70">
                  {it.time}
                </span>
                <span className="mx-4 text-white/40">•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
