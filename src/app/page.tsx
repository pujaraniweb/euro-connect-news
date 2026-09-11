import { Hero } from "@/components/hero";
import { MarketStrip } from "@/components/market-strip";
import { Feed } from "@/components/feed";
import { articles, fromGenerated, type GeneratedItem } from "@/lib/mock-data";
import { detectRegion } from "@/lib/region";
import { REGION_CATEGORY } from "@/lib/region-shared";
import { matchesCategory } from "@/lib/categories";
import localNews from "@/data/local-news.json";

const POOLS = localNews as unknown as Record<string, GeneratedItem[]>;

export default async function HomePage() {
  const region = await detectRegion();

  // Hero lead block = the visitor's local news (pre-computed pool in
  // local-news.json), so the very first story is always from their region.
  const leadCategory = REGION_CATEGORY[region];
  const pool = POOLS[region] ?? POOLS.world ?? [];
  const leadArticles = pool.map((it, i) => fromGenerated(it, i));

  // ACTUAL LISTING is region-ordered too: the detected region's news leads the
  // feed, then everything else follows in newest-first order. This makes the
  // news cards — not just the navbar — change with the visitor's country.
  // Preference: this region's CURRENT window news first (freshest); if that is
  // thin (e.g. few current India stories), supplement with the region's recent
  // pool so the listing still leads local. Hero stories are excluded to avoid
  // duplicates. Nothing is hidden — ordering only.
  //
  // The region lead is capped to RECENT_MS: regional feeds are sparse (the
  // India pool can reach back a week), and without a cap those stale items
  // pinned the whole first page of "Latest News" above far fresher global
  // news. Older regional stories are not dropped — they simply take their
  // normal newest-first place below. Both groups are sorted by date.
  const RECENT_MS = 24 * 60 * 60 * 1000;
  const at = (a: (typeof articles)[number]) => new Date(a.publishedAt).getTime();
  const byNewest = (a: (typeof articles)[number], b: (typeof articles)[number]) =>
    at(b) - at(a);
  const isRecent = (a: (typeof articles)[number]) => Date.now() - at(a) < RECENT_MS;
  const slug = REGION_CATEGORY[region].toLowerCase();
  const isLocal = (a: (typeof articles)[number]) =>
    matchesCategory({ title: a.title, excerpt: a.excerpt, category: a.category }, slug);
  const seen = new Set(leadArticles.slice(0, 4).map((a) => a.id)); // hero items
  const candidates: typeof articles = [];
  for (const a of [...articles, ...leadArticles]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    candidates.push(a);
  }
  const localFirst = candidates.filter((a) => isLocal(a) && isRecent(a)).sort(byNewest);
  const hoisted = new Set(localFirst.map((a) => a.id));
  const rest = candidates.filter((a) => !hoisted.has(a.id)).sort(byNewest);
  const orderedArticles = [...localFirst, ...rest];

  return (
    <>
      <Hero leadArticles={leadArticles} leadCategory={leadCategory} />
      <MarketStrip />
      <Feed articles={orderedArticles} />
    </>
  );
}
