/**
 * Country → region mapping shared by the SERVER detector (region.ts) and the
 * CLIENT verifier (components/region-sync.tsx). Dependency-free (no next/headers)
 * so it is safe to import on the client.
 */
export type Region = "india" | "europe" | "usa" | "world";

// ISO 3166-1 alpha-2 codes for Europe (EU + wider Europe, incl. UK).
export const EUROPE_COUNTRIES = new Set([
  "AL", "AD", "AT", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE",
  "ES", "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS",
  "IT", "JE", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO",
  "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "UA", "VA", "XK",
]);

/** India / European country → region, or null when the country is neither. */
export function regionForCountry(cc: string): Region | null {
  const code = (cc || "").trim().toUpperCase();
  if (!code) return null;
  if (code === "IN") return "india";
  if (code === "US") return "usa";
  if (EUROPE_COUNTRIES.has(code)) return "europe";
  return null;
}

/**
 * Worldwide mapping: India and European countries get their local section;
 * every other country (US, Asia, Africa, Americas, Oceania, Middle East…) gets
 * the global "world" section — nobody is defaulted to India.
 */
export function regionForCountryWorldwide(cc: string): Region {
  return regionForCountry(cc) ?? "world";
}

export const COOKIE_NAME = "ECN_REGION";
