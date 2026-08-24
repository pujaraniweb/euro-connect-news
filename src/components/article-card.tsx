import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Article } from "@/lib/types";
import { imageUrl, localize } from "@/lib/mock-data";
import { NewsImage } from "@/components/news-image";
import { timeAgo } from "@/lib/utils";
import { CategoryPill } from "@/components/category-pill";
import { BookmarkButton, ShareButton } from "@/components/card-actions";

export function ArticleCard({ article }: { article: Article }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { title, excerpt } = localize(article, locale);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg">
      <div className="relative block aspect-[16/10] overflow-hidden">
        <NewsImage
          src={imageUrl(article.imageSeed, 800, 500)}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {article.isLive && (
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-sm bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-current pulse-dot" />
            {t("live")}
          </span>
        )}
        {article.aiImage && (
          <span
            title="AI-generated image"
            aria-label="AI-generated image"
            className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-white/90 ring-2 ring-black/40 backdrop-blur"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <CategoryPill category={article.category} />
          <span className="text-[11px] text-muted-foreground">
            {t("minRead", { count: article.readTime })}
          </span>
        </div>

        {/* Stretched link makes the whole card clickable (buttons below sit above it). */}
        <Link
          href={`/article/${article.slug}`}
          className="group/title after:absolute after:inset-0"
        >
          <h3 className="font-serif text-lg font-bold leading-snug tracking-tight transition-colors group-hover/title:text-accent">
            {title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {excerpt}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              {article.source}
            </span>
            <span aria-hidden>·</span>
            <time suppressHydrationWarning>{timeAgo(article.publishedAt)}</time>
          </div>
          <div className="relative z-10 flex items-center">
            <BookmarkButton id={article.id} />
            <ShareButton title={title} slug={article.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
