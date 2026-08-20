export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "ECN_LOCALE";

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};
