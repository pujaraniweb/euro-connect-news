"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Radio, LayoutGrid, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", key: "home", icon: Home },
  { href: "/live", key: "live", icon: Radio },
  { href: "/category/world", key: "categories", icon: LayoutGrid },
  { href: "/search", key: "search", icon: Search },
  { href: "/preferences", key: "preferences", icon: SlidersHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("bottomNav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, key, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-accent" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
