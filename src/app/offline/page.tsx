import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "You're offline",
};

export default async function OfflinePage() {
  const t = await getTranslations("offline");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-muted text-muted-foreground">
        <WifiOff className="h-8 w-8" />
      </span>
      <h1 className="mt-5 font-serif text-2xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        {t("tryAgain")}
      </Link>
    </div>
  );
}
