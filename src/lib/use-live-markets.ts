"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markets as seed } from "@/lib/mock-data";
import type { MarketQuote } from "@/lib/types";

const POLL_MS = 60_000;

/**
 * Live market quotes from /api/markets (Yahoo Finance, no key, server-side).
 * Seeded with the static values so the first render is deterministic (no
 * hydration mismatch); replaced with real data on mount and every 60s.
 */
export function useLiveMarkets(): {
  markets: MarketQuote[];
  updatedAt: string | null;
  refresh: () => void;
} {
  const [markets, setMarkets] = useState<MarketQuote[]>(seed);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (alive.current && Array.isArray(data.items) && data.items.length) {
        setMarkets(data.items);
        setUpdatedAt(data.updatedAt ?? null);
      }
    } catch {
      /* keep last-known values */
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive.current = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  return { markets, updatedAt, refresh: load };
}
