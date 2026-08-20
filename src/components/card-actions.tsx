"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Link2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const KEY = "ecn:bookmarks";

function readBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function BookmarkButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readBookmarks().includes(id));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = readBookmarks();
    const next = list.includes(id)
      ? list.filter((x) => x !== id)
      : [...list, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(id));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      aria-pressed={saved}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md transition-colors hover:bg-surface-muted",
        saved ? "text-accent" : "text-muted-foreground"
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}

export function ShareButton({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.euroconnectnews.com/article/${slug}`;

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share"
      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {copied ? (
        <Check className="h-4 w-4 text-up" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </button>
  );
}

export function CopyLinkButton() {
  const t = useTranslations("article");
  const [copied, setCopied] = useState(false);

  async function copy() {
    // Copy the CURRENT internal Euro Connect News article URL (preserves the id),
    // never an external publisher URL or the homepage.
    const url = window.location.href;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      // Fallback for browsers without the async Clipboard API / non-secure contexts.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-up" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? t("copied") : t("copyLink")}
    </button>
  );
}
