import { Hero } from "@/components/hero";
import { MarketStrip } from "@/components/market-strip";
import { Feed } from "@/components/feed";
import { articles, fromGenerated, type GeneratedItem } from "@/lib/mock-data";
import { detectRegion } from "@/lib/region";
import localNews from "@/data/local-news.json";

export default async function HomePage() {
  const region = await detectRegion();
  // First news block = the visitor's local category. These are pre-computed at
  // generation time into a tiny local-news.json (top India + Europe stories from
  // the full corpus), so the homepage always has real local coverage WITHOUT
  // importing the heavy archive.json into the homepage bundle.
  const leadCategory =
    region === "europe" ? "Europe" : region === "world" ? "World" : "India";
  const pool = (
    region === "europe"
      ? localNews.europe
      : region === "world"
        ? localNews.world
        : localNews.india
  ) as GeneratedItem[];
  const leadArticles = pool.map((it, i) => fromGenerated(it, i));

  return (
    <>
      <Hero leadArticles={leadArticles} leadCategory={leadCategory} />
      <MarketStrip />
      <Feed articles={articles} />
    </>
  );
}
