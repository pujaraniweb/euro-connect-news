import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { SITE_PAGES, SITE_PAGE_SLUGS } from "@/lib/site-pages";

type Locale = "en" | "hi";

export function generateStaticParams() {
  return SITE_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = SITE_PAGES[slug];
  if (!page) return { title: "Page not found" };
  const locale = (await getLocale()) as Locale;
  return { title: page.title[locale], description: page.intro[locale] };
}

export default async function SitePageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = SITE_PAGES[slug];
  if (!page) notFound();

  const locale = (await getLocale()) as Locale;
  const tc = await getTranslations("category");

  return (
    <article className="py-6">
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-accent">
          {tc("home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{page.title[locale]}</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {page.title[locale]}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{page.intro[locale]}</p>
        <div className="mt-6 space-y-4 leading-[1.7] text-foreground/90">
          {page.body.map((p, i) => (
            <p key={i}>{p[locale]}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
