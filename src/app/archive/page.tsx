import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getArchivedArticles, allSources } from "@/lib/archive";
import { ArchiveBrowser } from "@/components/archive-browser";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("archive");
  return { title: t("title"), description: t("subtitle") };
}

export default async function ArchivePage() {
  // Pass the most recent slice to keep the page payload light; archive.json
  // still retains the full history for search and future browsing.
  const [archived, sources] = await Promise.all([
    getArchivedArticles(),
    allSources(),
  ]);
  return <ArchiveBrowser articles={archived.slice(0, 400)} sources={sources} />;
}
