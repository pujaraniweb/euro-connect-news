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
  asia: /\b(asia|asian|china|chinese|japan|japanese|korea|korean|beijing|tokyo|seoul|hong kong|taiwan|singapore|malaysia|indonesia|vietnam|thailand|philippines|pakistan|bangladesh|sri lanka|nepal|myanmar|kazakh|mongolia)\b/i,
  africa: /\b(africa|african|nigeria|kenya|south africa|egypt|ethiopia|ghana|somalia|sudan|uganda|tanzania|zimbabwe|morocco|algeria|congo|rwanda|senegal|angola|cameroon|johannesburg|lagos|nairobi|cairo)\b/i,
  middleeast: /\b(middle east|saudi|uae|emirates|qatar|kuwait|bahrain|oman|iran|iranian|iraq|israel|israeli|palestin|gaza|syria|syrian|lebanon|jordan|yemen|tehran|riyadh|dubai|jerusalem|turkey|türkiye|istanbul)\b/i,
  latinamerica: /\b(latin america|brazil|brazilian|mexico|mexican|argentina|chile|colombia|venezuela|peru|bolivia|ecuador|uruguay|paraguay|cuba|caribbean|rio de janeiro|buenos aires|bogota|santiago|havana)\b/i,
  oceania: /\b(australia|australian|new zealand|sydney|melbourne|auckland|fiji|papua new guinea|samoa|tonga|pacific island)\b/i,
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
