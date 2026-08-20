import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Info } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { articles, imageUrl, localize } from "@/lib/mock-data";
import { findArticle } from "@/lib/archive";
import { articleBody, articleKeyPoints, getRelated } from "@/lib/article-content";
import { CategoryPill } from "@/components/category-pill";
import { ArticleReader } from "@/components/article-reader";
import { BackButton } from "@/components/back-button";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = findArticle(slug);
  if (!a) return { title: "Article not found" };
  const locale = await getLocale();
  const { title, excerpt } = localize(a, locale);
  return {
    title,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      images: [imageUrl(a.imageSeed, 1200, 630)],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const t = await getTranslations("article");
  const tcommon = await getTranslations("common");
  const tcat = await getTranslations("category");
  const tcatName = await getTranslations("categories");
  const locale = await getLocale();
  const { title, excerpt } = localize(article, locale);
  const body = articleBody(article, locale);
  const keyPoints = articleKeyPoints(article, locale);
  const related = getRelated(article);
  const published = new Date(article.publishedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="py-6">
      {/* Breadcrumb + Back */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <BackButton />
        <span className="text-border">|</span>
        <Link href="/" className="hover:text-accent">
          {tcat("home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/category/${article.category.toLowerCase()}`}
          className="hover:text-accent"
        >
          {tcatName(article.category)}
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          {article.isBreaking && (
            <span className="rounded-sm bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
              {tcommon("breaking")}
            </span>
          )}
          <CategoryPill category={article.category} />
        </div>

        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">{excerpt}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-border py-4 text-sm">
          {article.author && article.author !== article.source && (
            <span className="font-semibold">{article.author} ·</span>
          )}
          <span className="font-semibold">{article.source}</span>
          <span className="text-muted-foreground">· {published}</span>
          <span className="ml-auto rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {tcommon("minRead", { count: article.readTime })}
          </span>
        </div>
      </div>

      {/* Hero image */}
      <figure className="mx-auto mt-6 max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={imageUrl(article.imageSeed, 1200, 700)}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-2 text-xs text-muted-foreground">
          {t("representativeImage")} · {article.source}
        </figcaption>
      </figure>

      {/* Body + key points */}
      <div className="mx-auto mt-8 max-w-3xl">
        {/* What you need to know */}
        <aside className="mb-8 rounded-xl border border-border bg-surface-muted p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <Info className="h-4 w-4 text-india" />
            {t("whatYouNeed")}
          </h2>
          <ul className="space-y-2">
            {keyPoints.map((k, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {k}
              </li>
            ))}
          </ul>
        </aside>

        <ArticleReader
          id={article.id}
          slug={article.slug}
          title={title}
          paragraphs={body}
        />

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground/80"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Source attribution — text only, never an external link. "Read Full
            Story" lives in the reader above and expands the article in place. */}
        <div className="mt-6 text-xs text-muted-foreground">
          {t("sourceAttribution", { source: article.source })}
        </div>
      </div>

      {/* Related */}
      <section className="mt-12 border-t border-border pt-8">
        <h2 className="mb-5 font-serif text-2xl font-bold tracking-tight">
          {t("relatedStories")}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {related.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="group w-64 shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={imageUrl(a.imageSeed, 400, 250)}
                  alt={localize(a, locale).title}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <CategoryPill category={a.category} />
                <h3 className="mt-1 line-clamp-2 font-serif text-sm font-bold leading-snug transition-colors group-hover:text-accent">
                  {localize(a, locale).title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
