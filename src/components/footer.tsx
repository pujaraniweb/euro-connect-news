import Link from "next/link";
import { useTranslations } from "next-intl";

// Inline brand glyphs (lucide removed brand icons over trademark concerns).
function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const SECTIONS: { titleKey: string; linkKeys: string[] }[] = [
  { titleKey: "Sections", linkKeys: ["World", "Europe", "Business", "Technology", "Sports"] },
  { titleKey: "IndiaEurope", linkKeys: ["Trade", "Visas", "Diaspora", "Markets"] },
  { titleKey: "Company", linkKeys: ["Archive", "About", "Editorial", "Contact"] },
  { titleKey: "Legal", linkKeys: ["Privacy", "Terms", "Cookies", "GDPR"] },
];

// Every footer link resolves to a real route.
const FOOTER_HREFS: Record<string, string> = {
  World: "/category/world",
  Europe: "/category/europe",
  Business: "/category/business",
  Technology: "/category/technology",
  Sports: "/category/sports",
  Trade: "/category/business",
  Visas: "/category/visa",
  Diaspora: "/category/india",
  Markets: "/dashboard",
  Archive: "/archive",
  About: "/page/about",
  Editorial: "/page/editorial",
  Contact: "/page/contact",
  Privacy: "/page/privacy",
  Terms: "/page/terms",
  Cookies: "/page/cookies",
  GDPR: "/page/gdpr",
};

function footerHref(key: string): string {
  return FOOTER_HREFS[key] ?? "/";
}

const SOCIALS = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=https://www.euroconnectnews.com",
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.96 1.43-3.96 4.07v2.34H8v3.1h2.67V21h2.83z",
  },
  {
    label: "X",
    url: "https://twitter.com/intent/tweet?url=https://www.euroconnectnews.com&text=Euro%20Connect%20News",
    path: "M17.53 3H20l-6.35 7.26L21 21h-5.9l-4.62-6-5.29 6H2.7l6.8-7.77L2.5 3h6.05l4.18 5.53L17.53 3zm-1.03 16.2h1.36L7.6 4.72H6.14L16.5 19.2z",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/sharing/share-offsite/?url=https://www.euroconnectnews.com",
    path: "M6.94 6.5A1.94 1.94 0 113.06 6.5a1.94 1.94 0 013.88 0zM3.4 8.9h3.1V21H3.4V8.9zm5.4 0h2.97v1.65h.04c.41-.78 1.42-1.6 2.93-1.6 3.13 0 3.71 2.06 3.71 4.74V21h-3.1v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H8.8V8.9z",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@euroconnectnews",
    path: "M21.6 7.2a2.5 2.5 0 00-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43A2.5 2.5 0 0021.6 16.8 26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3-5.2 3z",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/euroconnectnews",
    path: "M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.44.47.66.26 1.22.6 1.77 1.15.55.55.89 1.11 1.15 1.77.25.64.42 1.37.47 2.44.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.44-.26.66-.6 1.22-1.15 1.77-.55.55-1.11.89-1.77 1.15-.64.25-1.37.42-2.44.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.44-.47-.66-.26-1.22-.6-1.77-1.15-.55-.55-.89-1.11-1.15-1.77-.25-.64-.42-1.37-.47-2.44C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.44.26-.66.6-1.22 1.15-1.77.55-.55 1.11-.89 1.77-1.15.64-.25 1.37-.42 2.44-.47C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.51.21-1.86.35-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.31.88-.35 1.86-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.04.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.31 1.86.35 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.31-.88.35-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.21-1.51-.35-1.86-.18-.47-.4-.8-.75-1.15-.35-.35-.68-.57-1.15-.75-.35-.14-.88-.31-1.86-.35-1.05-.05-1.37-.06-4.04-.06zm0 3.06a5.14 5.14 0 110 10.28 5.14 5.14 0 010-10.28zm0 1.8a3.34 3.34 0 100 6.68 3.34 3.34 0 000-6.68zm5.34-2.94a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z",
  },
];

const RED = "#ef4444";

export function Footer() {
  const t = useTranslations("footer");
  const ts = useTranslations("footer.sections");
  const tl = useTranslations("footer.links");

  return (
    <footer className="mt-8 bg-[#0f1d3c] text-white/70">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="font-serif text-2xl font-bold tracking-tight text-white">
              Euro Connect<span style={{ color: RED }}>.</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/60">{t("blurb")}</p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map(({ label, url, path }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={
                    label === "YouTube" || label === "Instagram"
                      ? `Euro Connect News on ${label}`
                      : `Share on ${label}`
                  }
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
                >
                  <Icon path={path} />
                </a>
              ))}
            </div>
          </div>

          {SECTIONS.map(({ titleKey, linkKeys }) => (
            <div key={titleKey}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {ts(titleKey)}
              </h3>
              <span
                className="mt-2 block h-[3px] w-7 rounded-full"
                style={{ backgroundColor: RED }}
              />
              <ul className="mt-4 space-y-2.5">
                {linkKeys.map((l) => (
                  <li key={l}>
                    <Link
                      href={footerHref(l)}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {tl(l)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p>
            {t("independent")}{" "}
            <span className="font-semibold" style={{ color: RED }}>
              India–Europe.
            </span>
          </p>
          <p>{t("madeFor")}</p>
        </div>
      </div>
    </footer>
  );
}
