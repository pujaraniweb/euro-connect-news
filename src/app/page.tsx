import { Hero } from "@/components/hero";
import { MarketStrip } from "@/components/market-strip";
import { Feed } from "@/components/feed";
import { articles } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarketStrip />
      <Feed articles={articles} />
    </>
  );
}
