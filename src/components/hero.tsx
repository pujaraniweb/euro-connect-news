import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { articles, imageUrl, localize } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import { CategoryPill } from "@/components/category-pill";

const QUICK_LINKS = [
  "World",
  "Europe",
  "Business",
  "Visa",
  "Politics",
  "Culture",
  "Sports",
] as const;

export function Hero() {
  const t = useTranslations("common");
  const tq = useTranslations("home.quickLinks");
  const tcat = useTranslations("categories");
  const locale = useLocale();
  const lead = articles.find((a) => a.featured) ?? articles[0];
  const leadText = localize(lead, locale);
  const secondary = articles.filter((a) => a.id !== lead.id).slice(0, 3);

  return (
    <section className="py-6">
      {/* Search + quick links */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative flex w-full items-center md:max-w-md">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q}
              href={`/category/${q.toLowerCase()}`}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent hover:text-accent"
            >
              {tq(q)}
            </Link>
          ))}
        </div>
      </div>

      {/* Asymmetric grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Lead story */}
        <Link
          href={`/article/${lead.slug}`}
          className="group relative col-span-12 overflow-hidden rounded-xl lg:col-span-8"
        >
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <Image
              src={imageUrl(lead.imageSeed, 1200, 700)}
              alt={leadText.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <div className="mb-3 flex items-center gap-3">
              {lead.isBreaking && (
                <span className="rounded-sm bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
                  {t("breaking")}
                </span>
              )}
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                {tcat(lead.category)}
              </span>
            </div>
            <h1 className="max-w-3xl font-serif text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {leadText.title}
            </h1>
            <p className="mt-3 hidden max-w-2xl text-sm text-white/80 sm:block">
              {leadText.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
              {lead.author && lead.author !== lead.source && (
                <>
                  <span className="font-medium">{lead.author}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span>{lead.source}</span>
              <span aria-hidden>·</span>
              <time>{timeAgo(lead.publishedAt)}</time>
              <span aria-hidden>·</span>
              <span>{t("minRead", { count: lead.readTime })}</span>
            </div>
          </div>
        </Link>

        {/* Secondary column */}
        <div className="col-span-12 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface lg:col-span-4">
          {secondary.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="group flex gap-3 p-4 transition-colors hover:bg-surface-muted"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={imageUrl(a.imageSeed, 200, 200)}
                  alt={localize(a, locale).title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <CategoryPill category={a.category} />
                  {a.isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
                      {t("live")}
                    </span>
                  )}
                </div>
                <h3 className="line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-accent">
                  {localize(a, locale).title}
                </h3>
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  {timeAgo(a.publishedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
