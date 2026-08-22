"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

/** Subtle local placeholder used when a news image is missing or fails to load. */
export const NEWS_FALLBACK = "/news-fallback.svg";

/**
 * Drop-in replacement for next/image for NEWS images. Same rendering/props
 * (classes, aspect ratio, object-fit, sizes) — it only adds resilience:
 *   - async decoding, and lazy loading for anything not marked `priority`;
 *   - if a source fails, it shows a subtle local placeholder (never a broken
 *     icon, never a blurry image);
 *   - for on-demand AI illustrations (Pollinations), a failed request is often
 *     just a transient rate-limit while the image generates, so it retries a few
 *     times in the BACKGROUND and swaps the real image in once ready — the user
 *     only ever sees the clean placeholder or the finished image.
 */
export function NewsImage({
  src,
  alt,
  fallbackSrc = NEWS_FALLBACK,
  ...rest
}: ImageProps & { fallbackSrc?: string }) {
  const base = typeof src === "string" && src.length > 0 ? src : fallbackSrc;
  const isAI = typeof base === "string" && base.includes("pollinations.ai");
  const [current, setCurrent] = useState<string>(base);
  const attempt = useRef(0);

  // Reset when the source changes (e.g. client-side navigation).
  useEffect(() => {
    attempt.current = 0;
    setCurrent(base);
  }, [base]);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      decoding="async"
      loading={rest.priority ? undefined : rest.loading ?? "lazy"}
      onError={() => {
        if (current === fallbackSrc && attempt.current === 0) {
          // A non-AI source simply failed → show the placeholder.
          if (!isAI) return;
        }
        // Show the clean placeholder immediately (no broken icon / blur)…
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
        // …then, for AI illustrations, retry in the background and swap in when
        // the generated image is ready.
        if (isAI && attempt.current < 3) {
          attempt.current += 1;
          const n = attempt.current;
          const retryUrl = base + (base.includes("?") ? "&" : "?") + "_r=" + n;
          window.setTimeout(() => {
            const pre = new window.Image();
            pre.onload = () => setCurrent(retryUrl);
            pre.src = retryUrl;
          }, 2500 * n);
        }
      }}
    />
  );
}
