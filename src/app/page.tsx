import { Hero } from "@/components/hero";
import { MarketStrip } from "@/components/market-strip";
import { Feed } from "@/components/feed";
import { articles, fromGenerated, type GeneratedItem } from "@/lib/mock-data";
import { detectRegion, type Region } from "@/lib/region";
import { matchesCategory } from "@/lib/categories";
import localNews from "@/data/local-news.json";

const REGION_SLUG: Record<Region, string> = {
  india: "india",
  europe: "europe",
  usa: "usa",
  world: "world",
};
const REGION_CAT: Record<Region, "India" | "Europe" | "USA" | "World"> = {
  india: "India",
  europe: "Europe",
  usa: "USA",
  world: "World",
};

export default async function HomePage() {
  const region = await detectRegion();

  // Hero lead block = the visitor's local news (pre-computed pool in
  // local-news.json), so the very first story is always from their region.
  const leadCategory = REGION_CAT[region];
  const pool = (
    region === "europe"
      ? localNews.europe
      : region === "usa"
        ? localNews.usa
        : region === "world"
          ? localNews.world
          : localNews.india
  ) as GeneratedItem[];
  const leadArticles = pool.map((it, i) => fromGenerated(it, i));

  // ACTUAL LISTING is region-ordered too: the detected region's news leads the
  // feed, then everything else follows in newest-first order. This makes the
  // news cards — not just the navbar — change with the visitor's country.
  // Preference: this region's CURRENT window news first (freshest); if that is
  // thin (e.g. few current India stories), supplement with the region's recent
  // pool so the listing still leads local. Hero stories are excluded to avoid
  // duplicates. Nothing is hidden — ordering only.
  const slug = REGION_SLUG[region];
  const isLocal = (a: (typeof articles)[number]) =>
    matchesCategory({ title: a.title, excerpt: a.excerpt, category: a.category }, slug);
  const seen = new Set(leadArticles.slice(0, 4).map((a) => a.id)); // hero items
  const localFirst: typeof articles = [];
  for (const a of articles) if (isLocal(a) && !seen.has(a.id)) { seen.add(a.id); localFirst.push(a); }
  for (const a of leadArticles) if (!seen.has(a.id)) { seen.add(a.id); localFirst.push(a); }
  const rest = articles.filter((a) => !seen.has(a.id));
  const orderedArticles = [...localFirst, ...rest];

  return (
    <>
      <Hero leadArticles={leadArticles} leadCategory={leadCategory} />
      <MarketStrip />
      <Feed articles={orderedArticles} />
    </>
  );
}
