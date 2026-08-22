"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { MarketTicker } from "@/components/market-ticker";
import { BreakingTicker } from "@/components/breaking-ticker";
import { SubscribeButton } from "@/components/subscribe-button";
import { NotificationsButton } from "@/components/notifications-button";
import { WeatherWidget } from "@/components/weather-widget";
import { setLocale } from "@/i18n/actions";
import type { Locale } from "@/i18n/config";

// The fixed tail is identical for every visitor. Only the FIRST category is
// location-aware (INDIA for India visitors, EUROPE for European visitors).
const NAV_TAIL = [
  "World",
  "Health",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Culture",
  "Sports",
  "Crypto",
  "Opinion",
  "Visa",
] as const;

function navHref(label: string) {
  return `/category/${label.toLowerCase()}`;
}

export function Header({ region = "india" }: { region?: "india" | "europe" }) {
  const localCategory = region === "europe" ? "Europe" : "India";
  const NAV = [localCategory, ...NAV_TAIL];

  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const th = useTranslations("header");
  const tb = useTranslations("brand");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href;
  const pillClass = (active: boolean) =>
    cn(
      "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] tracking-tight transition-colors",
      active
        ? "bg-accent font-bold text-accent-foreground"
        : "font-semibold text-foreground/80 hover:bg-surface-muted hover:text-accent"
    );

  function switchLanguage() {
    const next: Locale = locale === "en" ? "hi" : "en";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-surface">
      {/* Utility bar */}
      <div className="hidden border-b border-border bg-surface-muted lg:block">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between gap-4 px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <time suppressHydrationWarning>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            <WeatherWidget />
          </div>
          <Link
            href="/dashboard"
            aria-label={th("marketsDashboard")}
            className="transition-opacity hover:opacity-80"
          >
            <MarketTicker />
          </Link>
        </div>
      </div>

      {/* Primary header */}
      <div
        className={cn(
          "border-b border-border transition-all duration-200",
          scrolled ? "py-2" : "py-3"
        )}
      >
        {/* TOP ROW: logo + controls (Theme · Language · Subscribe) */}
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/ecn-logo.png"
              alt="Euro Connect News logo"
              width={400}
              height={298}
              priority
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <span className="flex flex-col leading-none">
              <span
                className={cn(
                  "font-serif font-bold tracking-tight transition-all",
                  scrolled ? "text-base sm:text-lg" : "text-base sm:text-2xl"
                )}
              >
                Euro Connect News
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {tb("tagline")}
              </span>
            </span>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Secondary utilities — tablet & up */}
            <Link
              href="/live"
              className="hidden items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground sm:flex"
            >
              <span className="h-2 w-2 rounded-full bg-[#16a34a]">
                <span className="block h-2 w-2 animate-ping rounded-full bg-[#16a34a]" />
              </span>
              {tc("live")}
            </Link>
            <Link
              href="/search"
              aria-label={tc("search")}
              className="hidden h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground sm:grid"
            >
              <Search className="h-4 w-4" />
            </Link>
            <div className="hidden sm:block">
              <NotificationsButton />
            </div>

            {/* Divider keeps the primary controls as a distinct group */}
            <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

            {/* Primary controls — always visible: Theme · Language · Subscribe */}
            <ThemeToggle />
            <button
              type="button"
              onClick={switchLanguage}
              className="h-8 rounded-md px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              aria-label={th("toggleLanguage")}
            >
              {locale === "en" ? "EN" : "हि"}
            </button>
            <SubscribeButton />

            {/* Menu — mobile only */}
            <button
              type="button"
              aria-label={tc("menu")}
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-8 w-8 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-muted md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* MIDDLE ROW: main navigation — centered, bold, scrollable (tablet & up) */}
        <div className="mt-2 hidden border-t border-border/60 md:block">
          <nav className="mx-auto max-w-[1400px] overflow-x-auto px-4 pt-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            <div className="mx-auto flex w-max items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item}
                  href={navHref(item)}
                  className={pillClass(isActive(navHref(item)))}
                >
                  {t(item)}
                </Link>
              ))}
              <Link href="/youtube" className={pillClass(isActive("/youtube"))}>
                YouTube
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <nav className="border-t border-border px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-surface-muted"
              >
                {tc("allNews")}
              </Link>
              {NAV.map((item) => (
                <Link
                  key={item}
                  href={navHref(item)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-muted"
                >
                  {t(item)}
                </Link>
              ))}
              <Link
                href="/youtube"
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-surface-muted"
              >
                YouTube
              </Link>
            </div>
          </nav>
        )}
      </div>

      <BreakingTicker />
    </header>
  );
}
