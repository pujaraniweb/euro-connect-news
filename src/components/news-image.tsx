"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/** Subtle local placeholder used when a news image is missing or fails to load. */
export const NEWS_FALLBACK = "/news-fallback.svg";

/**
 * Drop-in replacement for next/image for NEWS images. Identical rendering and
 * props (same classes, aspect ratios, object-fit, sizes) — it only adds:
 *   - a graceful fallback to a subtle local placeholder if the source 404s,
 *     hot-link-blocks, or is empty, so a broken-image icon never shows;
 *   - async decoding, and lazy loading for anything not marked `priority`.
 * Everything else (layout, design) is unchanged.
 */
export function NewsImage({
  src,
  alt,
  fallbackSrc = NEWS_FALLBACK,
  ...rest
}: ImageProps & { fallbackSrc?: string }) {
  const initial = typeof src === "string" && src.length > 0 ? src : fallbackSrc;
  const [current, setCurrent] = useState(initial);

  // Keep in sync if the source prop changes (e.g. client-side navigation).
  useEffect(() => {
    setCurrent(typeof src === "string" && src.length > 0 ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      decoding="async"
      loading={rest.priority ? undefined : rest.loading ?? "lazy"}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
    />
  );
}
