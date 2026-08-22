/**
 * Country → region mapping shared by the SERVER detector (region.ts) and the
 * CLIENT verifier (components/region-sync.tsx). Dependency-free (no next/headers)
 * so it is safe to import on the client.
 *
 * Every country on earth maps to one of these regions; each region has a real,
 * keyword-filtered news section. India, the USA and Europe are their own
 * sections; the rest of the world is grouped by continent; anything unmapped
 * falls back to the global WORLD section (never India).
 */
export type Region =
  | "india"
  | "usa"
  | "europe"
  | "asia"
  | "africa"
  | "middleeast"
  | "latam"
  | "oceania"
  | "world";

// ISO 3166-1 alpha-2 country codes grouped by region.
const EUROPE = new Set([
  "AL", "AD", "AT", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE",
  "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS",
  "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO",
  "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA", "XK",
]);
const ASIA = new Set([
  "AF", "AM", "AZ", "BD", "BT", "BN", "KH", "CN", "GE", "ID", "JP", "KZ", "KG",
  "LA", "MY", "MV", "MN", "MM", "NP", "KP", "PK", "PH", "SG", "KR", "LK", "TW",
  "TJ", "TH", "TL", "TM", "UZ", "VN", "HK", "MO",
]);
const MIDDLEEAST = new Set([
  "BH", "IR", "IQ", "IL", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "SY", "TR",
  "AE", "YE",
]);
const AFRICA = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CI",
  "CD", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE",
  "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG",
  "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG",
  "ZM", "ZW",
]);
const LATAM = new Set([
  "AG", "AR", "BS", "BB", "BZ", "BO", "BR", "CL", "CO", "CR", "CU", "DM", "DO",
  "EC", "SV", "GD", "GT", "GY", "HT", "HN", "JM", "MX", "NI", "PA", "PY", "PE",
  "KN", "LC", "VC", "SR", "TT", "UY", "VE",
]);
const OCEANIA = new Set([
  "AU", "FJ", "KI", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV",
  "VU",
]);

// Backwards-compatible export (still used by older callers/tests).
export const EUROPE_COUNTRIES = EUROPE;

/** The specific region for a country code, or null if unmapped. */
export function regionForCountry(cc: string): Region | null {
  const code = (cc || "").trim().toUpperCase();
  if (!code) return null;
  if (code === "IN") return "india";
  if (code === "US") return "usa";
  if (EUROPE.has(code)) return "europe";
  if (ASIA.has(code)) return "asia";
  if (MIDDLEEAST.has(code)) return "middleeast";
  if (AFRICA.has(code)) return "africa";
  if (LATAM.has(code)) return "latam";
  if (OCEANIA.has(code)) return "oceania";
  return null;
}

/** Country → region, defaulting unmapped/unknown countries to the global WORLD
 * section (never India). */
export function regionForCountryWorldwide(cc: string): Region {
  return regionForCountry(cc) ?? "world";
}

/**
 * The news-section category label for each region. This is the first navbar item
 * and the homepage lead section for that region. (Category names are single
 * tokens so `/category/<label lowercased>` stays a clean URL; the visible text
 * comes from the translations.)
 */
export const REGION_CATEGORY: Record<
  Region,
  | "India"
  | "USA"
  | "Europe"
  | "Asia"
  | "Africa"
  | "MiddleEast"
  | "LatinAmerica"
  | "Oceania"
  | "World"
> = {
  india: "India",
  usa: "USA",
  europe: "Europe",
  asia: "Asia",
  africa: "Africa",
  middleeast: "MiddleEast",
  latam: "LatinAmerica",
  oceania: "Oceania",
  world: "World",
};

export const COOKIE_NAME = "ECN_REGION";
