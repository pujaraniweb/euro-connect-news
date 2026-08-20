import { Hero } from "@/components/hero";
import { MarketStrip } from "@/components/market-strip";
import { Feed } from "@/components/feed";
import { articles } from "@/lib/mock-data";
import { detectRegion } from "@/lib/region";
import { getCategoryArticles } from "@/lib/archive";

export default async function HomePage() {
  const region = await detectRegion();
  // First news block = the visitor's local category, pulled from the full corpus
  // (current + archive) so there is always real India/Europe coverage to lead
  // with, even when the current window has none.
  const localSlug = region === "europe" ? "europe" : "india";
  const leadCategory = region === "europe" ? "Europe" : "India";
  const leadArticles = getCategoryArticles(localSlug).slice(0, 8);

  return (
    <>
      <Hero leadArticles={leadArticles} leadCategory={leadCategory} />
      <MarketStrip />
      <Feed articles={articles} />
    </>
  );
}
