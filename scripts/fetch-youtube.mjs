// @ts-nocheck
/**
 * Euro Connect News — YouTube video collector (FULL history).
 *
 * Retrieves the COMPLETE available video history from the official channel
 * @euroconnectnews using YouTube's own public data — no API key, no News API:
 *
 *   1. Loads the public channel Videos page:
 *        https://www.youtube.com/@euroconnectnews/videos
 *      and reads the embedded ytInitialData + the InnerTube key/client version.
 *   2. Follows the channel's continuation tokens through the public InnerTube
 *      "browse" endpoint, page after page, until there is NO next token — i.e.
 *      it does not stop after the first page; it collects every available video.
 *   3. Also reads the official Atom feed for exact publish timestamps on the
 *      most recent uploads (the scraped list only exposes relative dates).
 *
 * The result is merged into a persistent archive (src/data/youtube.json) keyed
 * by the unique YouTube video id, so:
 *   - the full back-catalogue (latest + previous + older) is captured,
 *   - new uploads appear automatically at the top (run by the GitHub Action),
 *   - older videos are NEVER removed (permanent, growing history),
 *   - no video is stored twice (dedup by video id),
 *   - order is newest -> oldest.
 *
 * Only real videos that belong to @euroconnectnews are stored. Nothing is
 * hard-coded or faked. Run: node scripts/fetch-youtube.mjs  (npm run fetch-youtube)
 */
import Parser from "rss-parser";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/youtube.json");

const CHANNEL_ID = process.env.YT_CHANNEL_ID || "UCSuI6QmSDCfLnKk_sXN9XVg";
const HANDLE = "@euroconnectnews";
const VIDEOS_URL = `https://www.youtube.com/${HANDLE}/videos?hl=en&gl=US`;
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const HTTP_HEADERS = {
  "User-Agent": BROWSER_UA,
  "Accept-Language": "en-US,en;q=0.9",
  // CONSENT cookie skips the EU consent interstitial so we get real data.
  Cookie: "CONSENT=YES+1",
};
// Safety cap so a broken continuation loop can never run forever. The channel
// has far fewer pages than this; the loop normally ends when tokens run out.
const MAX_PAGES = 200;

const stripHtml = (s = "") =>
  s.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();

/** Turn a relative label ("1 year ago", "Streamed 3 days ago") into an ISO date. */
function relativeToIso(text) {
  if (!text) return null;
  const t = String(text).toLowerCase();
  const m = t.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unitMs = {
    second: 1e3,
    minute: 6e4,
    hour: 36e5,
    day: 864e5,
    week: 6048e5,
    month: 2592e6, // ~30 days
    year: 31536e6, // 365 days
  }[m[2]];
  return new Date(Date.now() - n * unitMs).toISOString();
}

/** Recursively pull every `lockupViewModel` video and the next continuation token. */
function harvest(node, out) {
  if (!node || typeof node !== "object") return;

  if (node.lockupViewModel && node.lockupViewModel.contentId) {
    const lk = node.lockupViewModel;
    if (
      !lk.contentType ||
      lk.contentType === "LOCKUP_CONTENT_TYPE_VIDEO"
    ) {
      const meta = lk.metadata?.lockupMetadataViewModel;
      const title = meta?.title?.content?.trim();
      const rows =
        meta?.metadata?.contentMetadataViewModel?.metadataRows || [];
      let published = null;
      for (const row of rows) {
        for (const part of row.metadataParts || []) {
          const c = part.text?.content || "";
          if (/\bago\b/i.test(c) || /^(streamed|premiered)/i.test(c)) {
            published = c;
          }
        }
      }
      // Duration badge (e.g. "4:40"), when present.
      let duration = null;
      const overlays =
        lk.contentImage?.thumbnailViewModel?.overlays || [];
      for (const ov of overlays) {
        const badges =
          ov.thumbnailBottomOverlayViewModel?.badges || [];
        for (const b of badges) {
          const txt = b.thumbnailBadgeViewModel?.text;
          if (txt && /^\d+(:\d+)+$/.test(txt)) duration = txt;
        }
      }
      if (title && !out.seen.has(lk.contentId)) {
        out.seen.add(lk.contentId);
        out.videos.push({
          id: lk.contentId,
          title,
          publishedText: published,
          duration,
        });
      }
    }
  }

  if (node.continuationItemRenderer) {
    const tok =
      node.continuationItemRenderer?.continuationEndpoint?.continuationCommand
        ?.token;
    if (tok) out.token = tok;
  }

  for (const k in node) harvest(node[k], out);
}

/** Scrape the complete video list by walking every continuation page. */
async function scrapeAllVideos() {
  const res = await fetch(VIDEOS_URL, { headers: HTTP_HEADERS });
  if (!res.ok) throw new Error(`channel page HTTP ${res.status}`);
  const html = await res.text();

  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion =
    html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1] ||
    html.match(/"clientVersion":"([^"]+)"/)?.[1];
  const dataMatch =
    html.match(/ytInitialData\s*=\s*(\{.+?\});<\/script>/s) ||
    html.match(/ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s) ||
    html.match(/ytInitialData\s*=\s*(\{.+?\});/s);
  if (!apiKey || !clientVersion || !dataMatch) {
    throw new Error("could not read InnerTube config from channel page");
  }

  const out = { videos: [], seen: new Set(), token: null };
  harvest(JSON.parse(dataMatch[1]), out);

  let token = out.token;
  let pages = 1;
  while (token && pages < MAX_PAGES) {
    out.token = null;
    const body = {
      context: { client: { clientName: "WEB", clientVersion, hl: "en", gl: "US" } },
      continuation: token,
    };
    const r = await fetch(
      `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}&prettyPrint=false`,
      {
        method: "POST",
        headers: { ...HTTP_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!r.ok) break;
    const before = out.videos.length;
    harvest(await r.json(), out);
    pages += 1;
    // Stop if a page returned no new videos AND gave no new token.
    if (out.videos.length === before && !out.token) break;
    token = out.token;
  }

  console.log(`[youtube] scraped ${out.videos.length} videos across ${pages} page(s)`);
  return out.videos; // already in newest -> oldest channel order
}

/** Official Atom feed → exact ISO dates + descriptions for recent uploads. */
async function fetchFeed() {
  const parser = new Parser({
    timeout: 20000,
    headers: { "User-Agent": BROWSER_UA },
    customFields: {
      item: [
        ["yt:videoId", "videoId"],
        ["media:group", "mediaGroup"],
      ],
    },
  });
  const map = new Map();
  try {
    const parsed = await parser.parseURL(FEED);
    for (const item of parsed.items || []) {
      const id = item.videoId || (item.id ? String(item.id).split(":").pop() : "");
      if (!id) continue;
      const mg = item.mediaGroup || {};
      let md = mg["media:description"];
      if (Array.isArray(md)) md = md[0];
      if (md && typeof md === "object") md = md._ ?? "";
      map.set(id, {
        title: (item.title || "").trim(),
        publishedAt: item.isoDate || item.pubDate || null,
        description: stripHtml(md || item.contentSnippet || item.content || "").slice(0, 260),
      });
    }
  } catch (e) {
    console.warn("[youtube] feed unavailable:", e.message);
  }
  return map;
}

async function main() {
  console.log(`[youtube] collecting full history for ${HANDLE} (${CHANNEL_ID})…`);

  const feed = await fetchFeed();

  let scraped = [];
  try {
    scraped = await scrapeAllVideos();
  } catch (e) {
    console.warn("[youtube] full scrape failed, falling back to feed only:", e.message);
  }

  // Build fresh records in channel order (newest -> oldest). Prefer the feed's
  // exact timestamp/description; fall back to the relative-date approximation.
  //
  // The Videos tab is authoritative newest -> oldest, but relative labels
  // ("2 months ago") collapse many uploads onto near-identical timestamps and
  // lose that fine ordering. So we clamp each scraped date to be strictly older
  // than the one before it — preserving YouTube's real sequence — then every
  // video (including feed-only Shorts/streams) can be sorted purely by date.
  const fresh = [];
  const order = [];
  let ceiling = Infinity;
  for (const v of scraped) {
    const f = feed.get(v.id);
    const raw = f?.publishedAt || relativeToIso(v.publishedText) || null;
    let ms = raw ? new Date(raw).getTime() : ceiling - 1000;
    if (!(ms < ceiling)) ms = ceiling - 1000; // keep strictly decreasing
    ceiling = ms;
    const record = {
      id: v.id,
      title: f?.title || v.title,
      publishedAt: new Date(ms).toISOString(),
      thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      description: f?.description || "",
      duration: v.duration || null,
      url: `https://www.youtube.com/watch?v=${v.id}`,
    };
    fresh.push(record);
    order.push(v.id);
  }
  // If scraping failed, seed from the feed alone so the archive still updates.
  if (fresh.length === 0) {
    for (const [id, f] of feed) {
      fresh.push({
        id,
        title: f.title,
        publishedAt: f.publishedAt,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        description: f.description,
        duration: null,
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      order.push(id);
    }
  }

  // Merge into the persistent archive — never delete, dedup by video id.
  let existing = [];
  if (existsSync(OUT)) {
    try {
      existing = JSON.parse(readFileSync(OUT, "utf8")).items || [];
    } catch {
      /* ignore corrupt */
    }
  }
  const byId = new Map();
  for (const v of existing) byId.set(v.id, v);

  let newCount = 0;
  for (const v of fresh) {
    const prev = byId.get(v.id);
    if (prev) {
      prev.title = v.title || prev.title;
      prev.thumbnail = v.thumbnail || prev.thumbnail;
      prev.description = v.description || prev.description;
      prev.duration = v.duration || prev.duration || null;
      // Keep an exact feed date if we ever had one; otherwise refresh.
      if (v.publishedAt && !prev.publishedAtExact) {
        prev.publishedAt = v.publishedAt;
      }
      if (v.publishedAt && feed.has(v.id)) prev.publishedAtExact = true;
    } else {
      if (feed.has(v.id)) v.publishedAtExact = true;
      byId.set(v.id, v);
      newCount += 1;
    }
  }

  // Order the whole archive strictly newest -> oldest by date. Scraped dates are
  // clamped to YouTube's real sequence above, and feed-only videos carry exact
  // dates, so a single date sort interleaves everything correctly. Nothing is
  // dropped — archived videos not seen this run are still included. Ties break
  // on id for a stable, deterministic result.
  const ordered = [...byId.values()].sort((a, b) => {
    const d = new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
    return d !== 0 ? d : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        channel: HANDLE,
        channelId: CHANNEL_ID,
        channelUrl: `https://www.youtube.com/${HANDLE}`,
        generatedAt: new Date().toISOString(),
        total: ordered.length,
        items: ordered,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`[youtube] wrote ${ordered.length} videos (${newCount} new)`);
}

main().catch((err) => {
  console.error("[youtube] fatal:", err);
  process.exit(1);
});
