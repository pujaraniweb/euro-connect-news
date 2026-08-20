import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { videos, channelUrl, channelHandle } from "@/lib/youtube";
import { YouTubeGrid } from "@/components/youtube-grid";

export const metadata: Metadata = {
  title: "YouTube",
  description:
    "Latest videos from the official Euro Connect News YouTube channel — @euroconnectnews.",
};

export default async function YouTubePage() {
  const t = await getTranslations("youtube");

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            {t("kicker")}
          </span>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          {t("visitChannel", { handle: channelHandle })}
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <YouTubeGrid videos={videos} />
    </div>
  );
}
