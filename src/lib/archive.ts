import type { Article } from "./types";
import archive from "../data/archive.json";
import {
  fromGenerated,
  articles,
  getArticleBySlug as getCurrentBySlug,
  type GeneratedItem,
} from "./mock-data";

/**
 * The persistent archive (current + historical items, newest first). This module
 * is imported only by archive/search/category/article routes so the 45-day
 * archive.json never bloats the homepage bundle.
 */
const archiveItems = (archive?.items ?? []) as GeneratedItem[];

export const archivedArticles: Article[] =
  archiveItems.length > 0 ? archiveItems.map((it) => fromGenerated(it)) : articles;

/** De-duplicated corpus of every article (current + archived), newest first. */
export function getSearchCorpus(): Article[] {
  const byId = new Map<string, Article>();
  for (const a of [...articles, ...archivedArticles]) byId.set(a.id, a);
  return [...byId.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Distinct sources present across the archive. */
export function allSources(): string[] {
  return [...new Set(archivedArticles.map((a) => a.source))].sort();
}

// Some navbar entries are topics that span feeds rather than a section of their
// own (Visa, India, Health). They are matched by keyword across the corpus.
// Word boundaries avoid false hits (e.g. "migration" inside "e-migration").
const VIRTUAL_CATEGORIES: Record<string, RegExp> = {
  visa: /\b(visas?|immigration|immigrants?|migrants?|asylum seeker|work permit|work visa|green card|residence permit|citizenship application|border force)\b/i,
  india: /\b(india|indian|indians|delhi|mumbai|modi|rupee|bollywood|bengaluru|gujarat|kolkata|hyderabad)\b/i,
  health: /\b(health|healthcare|disease|diseases|vaccine|vaccines|hospital|hospitals|medical|medicine|nhs|cancer|virus|outbreak|mental health|patients?|doctors?|wellbeing|obesity|diabetes)\b/i,
};

/**
 * All articles in a category (current + archive), newest first, so every navbar
 * category has content — not just the current window. Category names are
 * normalised (case-insensitive) before filtering.
 */
export function getCategoryArticles(category: string): Article[] {
  const slug = category.trim().toLowerCase();
  const corpus = getSearchCorpus();
  const re = VIRTUAL_CATEGORIES[slug];
  if (re) return corpus.filter((a) => re.test(`${a.title} ${a.excerpt}`));
  return corpus.filter((a) => a.category.toLowerCase() === slug);
}

/** Find an article by slug across current news AND the archive. */
export function findArticle(slug: string): Article | undefined {
  return getCurrentBySlug(slug) ?? archivedArticles.find((a) => a.slug === slug);
}
