import { cookies, headers } from "next/headers";
import {
  COOKIE_NAME,
  regionForCountryWorldwide,
  type Region,
} from "./region-shared";

/**
 * Location-aware "home" region. Only the FIRST navbar category and the first
 * homepage news block depend on this — everything else is identical for every
 * visitor.
 *
 *   India            → "india"  (first category = INDIA, India news first)
 *   European country → "europe" (first category = EUROPE, Europe news first)
 *   Anywhere else / detection fails → "india" (the site's default)
 *
 * Two-stage detection (both key-less, no GPS):
 *   1. SERVER (here): reads the country header the CDN/proxy forwards to the
 *      origin (Cloudflare `CF-IPCountry`, or `x-vercel-ip-country` from the
 *      OpenNext adapter). Instant, no client round-trip.
 *   2. CLIENT (components/region-sync.tsx): verifies against Cloudflare's
 *      always-on `/cdn-cgi/trace` in the visitor's own browser and corrects the
 *      region if the header was missing/wrong — immune to any HTML caching.
 * An `ECN_REGION` cookie (set by the client verifier, or manually) overrides
 * the header lookup.
 */
export type { Region };

export const LOCAL_LABEL: Record<Region, "India" | "Europe" | "USA" | "World"> = {
  india: "India",
  europe: "Europe",
  usa: "USA",
  world: "World",
};

/** Detect the visitor's home region (server components / route handlers only). */
export async function detectRegion(): Promise<Region> {
  // 1) Explicit override (client verifier / manual choice) wins.
  const cookieStore = await cookies();
  const override = cookieStore.get(COOKIE_NAME)?.value;
  if (
    override === "india" ||
    override === "europe" ||
    override === "usa" ||
    override === "world"
  )
    return override;

  // 2) Edge geolocation header forwarded to the origin — no API key required.
  const h = await headers();
  const cc =
    h.get("cf-ipcountry") ||
    h.get("x-vercel-ip-country") ||
    h.get("x-geo-country") ||
    h.get("x-country-code") ||
    "";
  // India / Europe → local section; every other country → the global "world"
  // section (never defaulted to India). Client verifier refines if needed.
  return regionForCountryWorldwide(cc);
}
