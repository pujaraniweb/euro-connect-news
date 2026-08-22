"use client";

import Image from "next/image";
import { useState } from "react";
import { Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { timeAgo } from "@/lib/utils";
import type { Video } from "@/lib/youtube";

const PAGE = 9;

export function YouTubeGrid({ videos }: { videos: Video[] }) {
  const t = useTranslations("youtube");
  const tc = useTranslations("common");
  const [visible, setVisible] = useState(PAGE);
  const [active, setActive] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
        <p className="font-medium">{t("noVideos")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("noVideosSub")}</p>
      </div>
    );
  }

  const shown = videos.slice(0, visible);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((v) => (
          <article
            key={v.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg"
          >
            <button
              type="button"
              onClick={() => setActive(v)}
              aria-label={`${t("play")}: ${v.title}`}
              className="relative block aspect-[16/9] overflow-hidden"
            >
              <Image
                src={v.thumbnail}
                alt={v.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
              </span>
              {v.duration && (
                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                  {v.duration}
                </span>
              )}
            </button>

            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {t("badge")}
                </span>
                <span
                  suppressHydrationWarning
                  className="text-[11px] text-muted-foreground"
                >
                  {timeAgo(v.publishedAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActive(v)}
                className="text-left"
              >
                <h3 className="font-serif text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-accent">
                  {v.title}
                </h3>
              </button>
              {v.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {v.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {visible < videos.length ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((n) => n + PAGE)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            {tc("loadMore")}
          </button>
        </div>
      ) : (
        videos.length > PAGE && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("endOfArchive")}
          </p>
        )
      )}

      {/* Player modal — plays the exact video INSIDE Euro Connect News */}
      {active && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <h2 className="line-clamp-1 font-serif text-sm font-bold">
                {active.title}
              </h2>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label={tc("menu")}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                key={active.id}
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
                title={active.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
