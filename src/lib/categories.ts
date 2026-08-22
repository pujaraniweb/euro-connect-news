/**
 * Keyword matchers for navbar topics that span feeds rather than being a single
 * source category (Visa, India, Health). Kept in a standalone, dependency-free
 * module so both the homepage (region.ts) and the archive/category routes
 * (archive.ts) share ONE definition — without pulling the heavy archive.json
 * into the homepage bundle.
 *
 * Word boundaries avoid false hits (e.g. "migration" inside "e-migration").
 */
export const VIRTUAL_CATEGORIES: Record<string, RegExp> = {
  visa: /\b(visas?|immigration|immigrants?|migrants?|asylum seeker|work permit|work visa|green card|residence permit|citizenship application|border force)\b/i,
  india: /\b(india|indian|indians|delhi|mumbai|modi|rupee|bollywood|bengaluru|gujarat|kolkata|hyderabad)\b/i,
  usa: /\b(u\.?s\.?a?|united states|america|american|washington|white house|biden|trump|congress|senate|pentagon|new york|california|texas|florida|wall street|fbi|nasa)\b/i,
  health: /\b(health|healthcare|disease|diseases|vaccine|vaccines|hospital|hospitals|medical|medicine|nhs|cancer|virus|outbreak|mental health|patients?|doctors?|wellbeing|obesity|diabetes)\b/i,
};

/** True when an article belongs to `slug` — virtual topics match by keyword,
 * everything else by its own category (case-insensitive). */
export function matchesCategory(
  article: { title: string; excerpt: string; category: string },
  slug: string
): boolean {
  const s = slug.trim().toLowerCase();
  const re = VIRTUAL_CATEGORIES[s];
  if (re) return re.test(`${article.title} ${article.excerpt}`);
  return article.category.toLowerCase() === s;
}
