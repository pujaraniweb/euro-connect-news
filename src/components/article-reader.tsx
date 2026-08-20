"use client";

import { useState } from "react";
import { AArrowDown, AArrowUp, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { BookmarkButton, ShareButton, CopyLinkButton } from "@/components/card-actions";
import { cn } from "@/lib/utils";

const SIZES = ["text-[15px]", "text-base", "text-lg", "text-xl"];

export function ArticleReader({
  id,
  slug,
  title,
  paragraphs,
}: {
  id: string;
  slug: string;
  title: string;
  paragraphs: string[];
}) {
  const t = useTranslations("article");
  const [size, setSize] = useState(1);
  const [expanded, setExpanded] = useState(false);

  // Show a preview; "Read Full Story" reveals the rest (stays inside the site).
  const PREVIEW = 2;
  const canExpand = paragraphs.length > PREVIEW;
  const shown = expanded || !canExpand ? paragraphs : paragraphs.slice(0, PREVIEW);

  return (
    <div className="relative">
      {/* Sticky action rail */}
      <div className="sticky top-40 z-10 mb-6 flex items-center gap-1 rounded-full border border-border bg-surface/95 px-2 py-1.5 backdrop-blur lg:absolute lg:-left-16 lg:top-0 lg:mb-0 lg:flex-col lg:rounded-xl">
        <BookmarkButton id={id} />
        <ShareButton title={title} slug={slug} />
        <div className="mx-1 h-5 w-px bg-border lg:mx-0 lg:my-1 lg:h-px lg:w-5" />
        <button
          type="button"
          aria-label={t("decreaseText")}
          onClick={() => setSize((s) => Math.max(0, s - 1))}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
          disabled={size === 0}
        >
          <AArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={t("increaseText")}
          onClick={() => setSize((s) => Math.min(SIZES.length - 1, s + 1))}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40"
          disabled={size === SIZES.length - 1}
        >
          <AArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={t("print")}
          onClick={() => window.print()}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>

      <div className={cn("space-y-5 leading-[1.7] text-foreground/90", SIZES[size])}>
        {shown.map((p, i) => (
          <p key={i} className={i === 0 ? "text-lg font-medium text-foreground" : ""}>
            {p}
          </p>
        ))}
      </div>

      {canExpand && !expanded && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            {t("readFullStory")}
          </button>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-4">
        <CopyLinkButton />
      </div>
    </div>
  );
}
