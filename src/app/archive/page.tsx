import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { archivedArticles, allSources } from "@/lib/archive";
import { ArchiveBrowser } from "@/components/archive-browser";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("archive");
  return { title: t("title"), description: t("subtitle") };
}

export default function ArchivePage() {
  // Pass the most recent slice to keep the page payload light; archive.json
  // still retains the full 45-day history for search and future browsing.
  return (
    <ArchiveBrowser articles={archivedArticles.slice(0, 400)} sources={allSources()} />
  );
}
