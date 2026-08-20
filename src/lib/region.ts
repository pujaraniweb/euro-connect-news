import { cookies, headers } from "next/headers";

/**
 * Location-aware "home" region. Only the FIRST navbar category and the first
 * homepage news block depend on this — everything else is identical for every
 * visitor.
 *
 *   India            → "india"  (first category = INDIA, India news first)
 *   European country → "europe" (first category = EUROPE, Europe news first)
 *   Anywhere else / detection fails → "india" (the site's default)
 *
 * Detection is server-side and key-less: the site runs behind Cloudflare, which
 * forwards the visitor's country as the `CF-IPCountry` request header. A few
 * common proxy headers are honoured too. An `ECN_REGION` cookie overrides the
 * geo lookup (used for manual selection / testing).
 */
export type Region = "india" | "europe";

export const LOCAL_LABEL: Record<Region, "India" | "Europe"> = {
  india: "India",
  europe: "Europe",
};

// ISO 3166-1 alpha-2 codes for Europe (EU + wider Europe, incl. UK).
const EUROPE_COUNTRIES = new Set([
  "AL", "AD", "AT", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE",
  "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS",
  "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO",
  "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA", "XK",
]);

function regionForCountry(cc: string): Region | null {
  const code = cc.trim().toUpperCase();
  if (!code) return null;
  if (code === "IN") return "india";
  if (EUROPE_COUNTRIES.has(code)) return "europe";
  return null;
}

/** Detect the visitor's home region (server components / route handlers only). */
export async function detectRegion(): Promise<Region> {
  // 1) Explicit override (manual choice / testing) wins.
  const cookieStore = await cookies();
  const override = cookieStore.get("ECN_REGION")?.value;
  if (override === "india" || override === "europe") return override;

  // 2) Edge geolocation header from the CDN/proxy — no API key required.
  const h = await headers();
  const cc =
    h.get("cf-ipcountry") ||
    h.get("x-vercel-ip-country") ||
    h.get("x-geo-country") ||
    h.get("x-country-code") ||
    "";
  const byGeo = regionForCountry(cc);
  if (byGeo) return byGeo;

  // 3) Fallback: India (the site's default), per spec.
  return "india";
}
