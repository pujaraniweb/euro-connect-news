import { NextResponse } from "next/server";
import { markets as seed } from "@/lib/mock-data";
import type { MarketQuote } from "@/lib/types";

// Live market quotes from Yahoo Finance's public chart endpoint (no API key).
// Fetched server-side; the browser never sees any credentials. If a quote can't
// be fetched, it falls back to the seed value and is flagged not-live (so we
// never present stale data as fresh).
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const OZ_TO_10G = 10 / 31.1035; // troy-ounce price -> per-10-gram price

const SYMBOLS: {
  symbol: string;
  name: string;
  yahoo: string;
  currency?: string;
  gold?: boolean;
}[] = [
  { symbol: "SENSEX", name: "BSE Sensex", yahoo: "^BSESN" },
  { symbol: "NIFTY", name: "Nifty 50", yahoo: "^NSEI" },
  { symbol: "EUR/INR", name: "Euro / Rupee", yahoo: "EURINR=X" },
  { symbol: "GOLD", name: "Gold (10g)", yahoo: "GC=F", currency: "₹", gold: true },
  { symbol: "BTC", name: "Bitcoin", yahoo: "BTC-USD", currency: "$" },
];

async function yahoo(sym: string): Promise<{ price: number; prev: number }> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    sym
  )}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 45 }, // cache upstream 45s to avoid rate limits
  });
  if (!res.ok) throw new Error(`yahoo ${sym} ${res.status}`);
  const json = await res.json();
  const m = json?.chart?.result?.[0]?.meta;
  if (!m || typeof m.regularMarketPrice !== "number")
    throw new Error(`yahoo ${sym} no price`);
  const prev =
    typeof m.chartPreviousClose === "number"
      ? m.chartPreviousClose
      : typeof m.previousClose === "number"
        ? m.previousClose
        : m.regularMarketPrice;
  return { price: m.regularMarketPrice, prev };
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export async function GET() {
  // USD/INR needed to price gold in rupees.
  let usdinr = 0;
  try {
    usdinr = (await yahoo("INR=X")).price;
  } catch {
    /* handled per-item below */
  }

  const items: (MarketQuote & { live: boolean })[] = await Promise.all(
    SYMBOLS.map(async (s) => {
      try {
        const { price, prev } = await yahoo(s.yahoo);
        let value = price;
        let prevVal = prev;
        if (s.gold) {
          if (!usdinr) throw new Error("no usdinr");
          value = price * usdinr * OZ_TO_10G;
          prevVal = prev * usdinr * OZ_TO_10G;
        }
        const change = value - prevVal;
        return {
          symbol: s.symbol,
          name: s.name,
          value: round(value),
          change: round(change),
          changePct: prevVal ? round((change / prevVal) * 100, 2) : 0,
          currency: s.currency,
          live: true,
        };
      } catch {
        const f = seed.find((x) => x.symbol === s.symbol);
        return {
          symbol: s.symbol,
          name: s.name,
          value: f?.value ?? 0,
          change: f?.change ?? 0,
          changePct: f?.changePct ?? 0,
          currency: s.currency ?? f?.currency,
          live: false,
        };
      }
    })
  );

  const anyLive = items.some((i) => i.live);
  return NextResponse.json(
    { updatedAt: anyLive ? new Date().toISOString() : null, items },
    { headers: { "Cache-Control": "public, max-age=45, s-maxage=45" } }
  );
}
