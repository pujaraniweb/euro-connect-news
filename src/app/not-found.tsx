import Link from "next/link";
import { getTranslations } from "next-intl/server";

const SUGGESTED = ["India", "Europe", "Business", "World"];

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tcat = await getTranslations("categories");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="font-serif text-7xl font-bold text-accent">404</span>
      <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("returnHome")}
      </Link>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTED.map((s) => (
          <Link
            key={s}
            href={`/category/${s.toLowerCase()}`}
            className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {tcat(s)}
          </Link>
        ))}
      </div>
    </div>
  );
}
