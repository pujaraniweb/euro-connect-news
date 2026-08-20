import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCategoryArticles } from "@/lib/archive";
import { ArticleGrid } from "@/components/article-grid";

const SUBCATS: Record<string, string[]> = {
  europe: ["EU Politics", "Germany", "France", "UK", "Netherlands"],
  business: ["Markets", "Trade", "Startups", "Remittances"],
  india: ["Visa", "Diaspora", "Policy", "Economy"],
  politics: ["Bilateral", "Defence", "Elections"],
};

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = titleCase(slug);
  return {
    title,
    description: `${title} news from the India–Europe corridor — Euro Connect News.`,
  };
}

const KNOWN: Record<string, string> = {
  world: "World",
  europe: "Europe",
  politics: "Politics",
  business: "Business",
  technology: "Technology",
  science: "Science",
  culture: "Culture",
  sports: "Sports",
  crypto: "Crypto",
  opinion: "Opinion",
  india: "India",
  health: "Health",
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tc = await getTranslations("category");
  const tcat = await getTranslations("categories");
  const tq = await getTranslations("home.quickLinks");
  const title =
    slug === "visa"
      ? tq("Visa")
      : KNOWN[slug]
        ? tcat(KNOWN[slug])
        : titleCase(slug);
  const list = getCategoryArticles(slug);
  const subcats = SUBCATS[slug] ?? [];

  return (
    <div className="py-6">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-accent">
          {tc("home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="mb-6 border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          {tc("section")}
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {tc("latestCoverage", { title })}
        </p>

        {subcats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subcats.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </Link>
            ))}
          </div>
        )}
      </div>

      <ArticleGrid articles={list} />
    </div>
  );
}
