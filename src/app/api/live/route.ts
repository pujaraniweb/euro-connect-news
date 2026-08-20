import { NextResponse } from "next/server";
import { articles, imageUrl, newsGeneratedAt } from "@/lib/mock-data";

// Serves the newest items from the existing RSS/FreshRSS-generated news data so
// the Live section can poll for updates without reloading the page. No news API.
export const dynamic = "force-dynamic";

export function GET() {
  const items = articles.slice(0, 25).map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    title: a.title,
    titleHi: a.titleHi,
    excerpt: a.excerpt,
    excerptHi: a.excerptHi,
    publishedAt: a.publishedAt,
    image: imageUrl(a.imageSeed, 400, 250),
  }));

  return NextResponse.json(
    { generatedAt: newsGeneratedAt, count: items.length, items },
    { headers: { "Cache-Control": "no-store" } }
  );
}
