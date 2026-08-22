"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  COOKIE_NAME,
  regionForCountryWorldwide,
  type Region,
} from "@/lib/region-shared";

/**
 * Client-side country verifier. The server already renders a best guess from the
 * geo header; this confirms it in the VISITOR'S OWN BROWSER against Cloudflare's
 * always-available `/cdn-cgi/trace` endpoint (which returns `loc=<ISO country>`).
 * If the confirmed region differs from what the server rendered, it stores an
 * `ECN_REGION` cookie and refreshes so the server re-renders BOTH the navbar's
 * first category AND the first news section for the correct region.
 *
 * - No GPS / geolocation permission, no manual country picker.
 * - Only a country→region label is stored (never coordinates).
 * - Runs per visitor in their browser, so it is immune to any HTML caching that
 *   could otherwise pin one region for everyone.
 * - If the trace is unreachable, the server's render (header or India default)
 *   stands — no infinite retries.
 */
export function RegionSync({ serverRegion }: { serverRegion: Region }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/cdn-cgi/trace", { cache: "no-store" });
        if (!res.ok) return;
        const text = await res.text();
        const loc = (text.match(/^loc=([A-Za-z]{2})/m) || [])[1];
        if (!loc) return;

        // India / Europe → local section; everywhere else → the global "world".
        const detected: Region = regionForCountryWorldwide(loc);
        if (cancelled || detected === serverRegion) return;

        // Persist the corrected region and re-render the server components.
        document.cookie = `${COOKIE_NAME}=${detected}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; samesite=lax`;
        router.refresh();
      } catch {
        /* trace unreachable → leave the server's render in place */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serverRegion, router]);

  return null;
}
