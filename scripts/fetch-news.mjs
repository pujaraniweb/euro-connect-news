// @ts-nocheck
/**
 * Euro Connect News — RSS/Atom news-collection layer.
 *
 * This is the ONLY news source for the site. There is NO news API anywhere in
 * the project — no NewsAPI / GNews / Bing / Google News, no API keys, no bearer
 * tokens, no secrets in frontend JS. News is collected purely from public
 * RSS/Atom feeds, exactly the role a self-hosted FreshRSS instance would play:
 *
 *   RSS / ATOM FEEDS -> this aggregator (classify + dedupe) -> current + archive
 *   JSON -> Euro Connect News frontend -> existing UI (unchanged).
 *
 * Configure feeds/categories in the FEEDS array below (the equivalent of adding
 * feeds under a category label in FreshRSS). Scheduled by
 * .github/workflows/update-news.yml (cron, every 2h) — the auto-update loop.
 *
 * Key behaviours:
 * - Public RSS/Atom feeds only. No browser scraping. No API keys required.
 * - Stable article id = SHA-1 of canonical URL -> cross-run duplicate detection.
 * - NEVER deletes: new items are merged into archive.json; older items are kept
 *   (45-day retention). generated-news.json holds the current window, newest-first.
 * - Real source image/description/date/source per article; publication time is
 *   preserved. imageType marks "real" vs "none" (never fakes an AI label).
 * - Only the feed's title/summary/link is stored — never the full copyrighted
 *   article body. The site links back to the original source.
 * - Bilingual EN + हिंदी: Hindi is machine-translated once via keyless MyMemory
 *   and cached across runs; on failure the item keeps English (honest fallback).
 *
 * Run locally: node scripts/fetch-news.mjs   (npm run fetch-news)
 * To add feeds: edit the FEEDS array. To swap in a hosted FreshRSS instance
 * later, replace the feed-fetch step with a call to its GReader API using
 * server-side credentials (GitHub Action secrets) — the frontend never changes.
 */

import Parser from "rss-parser";
import { createHash } from "node:crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");
const CURRENT_PATH = resolve(DATA_DIR, "generated-news.json");
const ARCHIVE_PATH = resolve(DATA_DIR, "archive.json");
const LOCAL_PATH = resolve(DATA_DIR, "local-news.json");

const CURRENT_ITEMS = 60; // newest items shown as "current" news
const ARCHIVE_DAYS = 45; // retention window for the archive (repo's concept)
const TRANSLATE_BUDGET = 70; // max NEW MyMemory translations per run (quota-friendly)
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || ""; // optional; raises quota; not a secret

/** Legitimate per-category RSS feeds. `category` is the primary hint. */
const FEEDS = [
  // WORLD
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", category: "World" },
  { url: "https://www.theguardian.com/world/rss", source: "The Guardian", category: "World" },
  // EUROPE
  { url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml", source: "BBC", category: "Europe" },
  { url: "https://www.euronews.com/rss?level=theme&name=news", source: "Euronews", category: "Europe" },
  // POLITICS
  { url: "https://feeds.bbci.co.uk/news/politics/rss.xml", source: "BBC", category: "Politics" },
  { url: "https://www.theguardian.com/politics/rss", source: "The Guardian", category: "Politics" },
  // BUSINESS
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC", category: "Business" },
  { url: "https://www.theguardian.com/uk/business/rss", source: "The Guardian", category: "Business" },
  // TECHNOLOGY
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC", category: "Technology" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", category: "Technology" },
  // SCIENCE
  { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", source: "BBC", category: "Science" },
  { url: "https://www.theguardian.com/science/rss", source: "The Guardian", category: "Science" },
  // CULTURE
  { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", source: "BBC", category: "Culture" },
  { url: "https://www.theguardian.com/culture/rss", source: "The Guardian", category: "Culture" },
  // SPORTS
  { url: "https://feeds.bbci.co.uk/sport/rss.xml", source: "BBC Sport", category: "Sports" },
  { url: "https://www.theguardian.com/sport/rss", source: "The Guardian", category: "Sports" },
  // CRYPTO
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk", category: "Crypto" },
  { url: "https://cointelegraph.com/rss", source: "Cointelegraph", category: "Crypto" },
  // OPINION
  { url: "https://www.theguardian.com/uk/commentisfree/rss", source: "The Guardian", category: "Opinion" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml", source: "The New York Times", category: "Opinion" },
];

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "EuroConnectNews/1.0 (+https://www.euroconnectnews.com)" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "creator"],
    ],
  },
});

// --- Classification -------------------------------------------------------
// Topical rules in priority order; the first matches win as "primary" when the
// feed hint is a broad bucket (World/Europe). Others become secondary tags.
const TOPICAL = [
  ["Crypto", ["bitcoin", "ethereum", "crypto", "blockchain", "stablecoin", "defi", "binance", "coinbase", "nft", "token"]],
  ["Science", ["space", "nasa", "scientist", "research", "physics", "biology", "climate", "telescope", "quantum", "fossil", "species", "astronom", "discovery", "genome"]],
  ["Technology", ["artificial intelligence", " ai ", "software", "gadget", "chip", "semiconductor", "startup", "cyber", "smartphone", "app ", "google", "apple", "microsoft", "openai", "robot"]],
  ["Business", ["market", "econom", "stocks", "trade", "earnings", "inflation", "gdp", "investor", "revenue", "merger", "tariff", "central bank"]],
  ["Sports", ["match", "league", "cup", "tournament", "olympic", "cricket", "football", "soccer", "tennis", "formula 1", "nba", "championship", "world cup"]],
  ["Culture", ["film", "movie", "music", "album", "museum", "festival", "celebrity", "theatre", "fashion", "novel", "gallery", "oscars"]],
  ["Politics", ["election", "minister", "parliament", "senate", "congress", "president", "vote", "diplomat", "sanction", "treaty", "policy", "war"]],
];
const EUROPE_GEO = [
  "europe", "european", "european union", " eu ", "eu's", "brussels", "eurozone",
  "germany", "german", "france", "french", "britain", "british", " uk ", "u.k.",
  "spain", "spanish", "italy", "italian", "netherlands", "dutch", "poland", "polish",
  "ukraine", "ukrainian", "nato", "greece", "portugal", "sweden", "norway", "finland",
  "denmark", "ireland", "belgium", "austria", "switzerland", "hungary", "romania",
  "czech", "scotland", "wales", "london", "paris", "berlin", "madrid", "rome",
];

// Feeds whose section IS their category. World/Europe feeds are classified by
// geography instead (they must not be demoted into topical categories).
const DEDICATED = new Set([
  "Politics", "Business", "Technology", "Science", "Culture", "Sports", "Crypto", "Opinion",
]);

function classify(text, hint) {
  const t = ` ${text.toLowerCase()} `;
  const isEuropean = EUROPE_GEO.some((k) => t.includes(k));
  const topicalMatches = TOPICAL.filter(([, kws]) => kws.some((k) => t.includes(k))).map(
    ([c]) => c
  );

  // Dedicated section feeds keep their topic; tag Europe as secondary if relevant.
  if (DEDICATED.has(hint)) {
    return { primary: hint, secondary: isEuropean ? ["Europe"] : [] };
  }

  // World / Europe feeds: geography decides. Prefer EUROPE for anything with a
  // European focus; otherwise it is genuinely international -> WORLD.
  if (hint === "Europe" || isEuropean) {
    return { primary: "Europe", secondary: topicalMatches.slice(0, 2) };
  }
  return { primary: "World", secondary: topicalMatches.slice(0, 2) };
}

// --- Helpers --------------------------------------------------------------
function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}
function firstImageFrom(item) {
  const media = [].concat(item.mediaContent || [], item.mediaThumbnail || []);
  for (const m of media) {
    const url = m?.$?.url || m?.url;
    if (url && /^https?:\/\//.test(url)) return url;
  }
  if (item.enclosure?.url && /image/i.test(item.enclosure.type || "")) return item.enclosure.url;
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)/i.test(item.enclosure.url)) return item.enclosure.url;
  const html = item.contentEncoded || item.content || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && /^https?:\/\//.test(m[1])) return m[1];
  return null;
}
function slugify(title, id) {
  const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim()
    .replace(/\s+/g, "-").slice(0, 60).replace(/-+$/g, "");
  return `${base || "story"}-${id.slice(0, 6)}`;
}
function readTimeFrom(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.min(9, Math.round(words / 40) + 2));
}
function trimWords(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}
const hasDevanagari = (s) => /[ऀ-ॿ]/.test(s || "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJson(path) {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
  } catch { /* ignore corrupt file */ }
  return null;
}

// Reuse previously-translated Hindi so we don't re-spend the free quota.
function buildTranslationCache() {
  const cache = new Map();
  for (const path of [CURRENT_PATH, ARCHIVE_PATH]) {
    const data = readJson(path);
    for (const it of data?.items ?? []) {
      if (it.titleHi && it.titleHi !== it.title) cache.set(`t:${it.id}`, it.titleHi);
      if (it.excerptHi && it.excerptHi !== it.excerpt) cache.set(`e:${it.id}`, it.excerptHi);
    }
  }
  return cache;
}

let translateBudget = TRANSLATE_BUDGET;
async function translateHi(text) {
  if (translateBudget <= 0) return null;
  const q = (text || "").slice(0, 480);
  if (!q) return null;
  const email = MYMEMORY_EMAIL ? `&de=${encodeURIComponent(MYMEMORY_EMAIL)}` : "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|hi${email}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.quotaFinished) { translateBudget = 0; return null; }
    const out = json?.responseData?.translatedText;
    if (!out || !hasDevanagari(out)) return null;
    translateBudget -= 1;
    return out;
  } catch {
    return null;
  }
}

// --- Source A: direct RSS/Atom feeds (default / fallback) -----------------
async function fetchFromFeeds() {
  console.log(`[news] fetching ${FEEDS.length} category feeds directly…`);
  const fetched = [];
  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items || []) {
        const title = (item.title || "").trim();
        if (!title || !item.link) continue;
        const desc = stripHtml(item.contentSnippet || item.summary || item.content || item.contentEncoded || "");
        const { primary, secondary } = classify(`${title} ${desc}`, feed.category);
        // Dedup by the canonical URL (stable across runs); keep the RSS GUID for
        // reference. Both identify the article uniquely — no article is stored twice.
        const guid = item.guid || item.link;
        const id = createHash("sha1").update(item.link).digest("hex");
        const image = firstImageFrom(item);
        const excerpt = desc ? trimWords(desc, 220) : title;
        fetched.push({
          id,
          slug: slugify(title, id),
          title,
          excerpt,
          category: primary,
          secondaryCategories: secondary,
          source: feed.source,
          author: (item.creator || feed.source).trim(),
          image,
          imageType: image ? "real" : "none",
          aiImage: false,
          readTime: readTimeFrom(excerpt),
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          sourceUrl: item.link,
          guid,
        });
      }
    } catch (err) {
      console.warn(`[news] feed failed: ${feed.url} — ${err.message}`);
    }
  }
  return fetched;
}

// --- Source B: a hosted FreshRSS instance (Google Reader API) -------------
// Enabled when FRESHRSS_URL + creds are set (GitHub Action secrets — never in
// frontend). FreshRSS aggregates the feeds server-side (incl. WebSub for feeds
// that support it); this reads its items and maps them into the same shape.
const FRESHRSS_URL = (process.env.FRESHRSS_URL || "").replace(/\/+$/, "");
const FRESHRSS_USER = process.env.FRESHRSS_USER || "";
const FRESHRSS_API_PASSWORD = process.env.FRESHRSS_API_PASSWORD || "";
const CATEGORY_NAMES = [
  "World", "Europe", "Politics", "Business", "Technology",
  "Science", "Culture", "Sports", "Crypto", "Opinion",
];

function imageFromHtml(html = "") {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m && /^https?:\/\//.test(m[1]) ? m[1] : null;
}

async function greaderLogin() {
  const res = await fetch(`${FRESHRSS_URL}/api/greader.php/accounts/ClientLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ Email: FRESHRSS_USER, Passwd: FRESHRSS_API_PASSWORD }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`GReader ClientLogin ${res.status}`);
  const line = (await res.text()).split(/\r?\n/).find((l) => l.startsWith("Auth="));
  if (!line) throw new Error("GReader ClientLogin returned no Auth token");
  return line.slice(5).trim();
}

async function fetchFromFreshRSS() {
  console.log(`[news] fetching from FreshRSS (GReader API) at ${FRESHRSS_URL} …`);
  const auth = await greaderLogin();
  const url =
    `${FRESHRSS_URL}/api/greader.php/reader/api/0/stream/contents/` +
    `user/-/state/com.google/reading-list?output=json&n=200`;
  const res = await fetch(url, {
    headers: { Authorization: `GoogleLogin auth=${auth}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`GReader stream/contents ${res.status}`);
  const data = await res.json();

  const fetched = [];
  for (const it of data.items || []) {
    const title = (it.title || "").trim();
    const link = it.canonical?.[0]?.href || it.alternate?.[0]?.href || "";
    if (!title || !link) continue;
    const html = it.summary?.content || it.content?.content || "";
    const desc = stripHtml(html);
    // FreshRSS folder name -> our category (fall back to keyword classify).
    const labels = (it.categories || [])
      .map((c) => (String(c).match(/\/label\/(.+)$/) || [])[1])
      .filter(Boolean);
    const labelCat = labels.find((l) => CATEGORY_NAMES.includes(l));
    const { primary, secondary } = classify(`${title} ${desc}`, labelCat || "World");
    // Dedup by GUID/canonical id supplied by FreshRSS.
    const guid = it.id || link;
    const id = createHash("sha1").update(link).digest("hex");
    const enc = Array.isArray(it.enclosure) ? it.enclosure[0] : null;
    const image =
      imageFromHtml(html) ||
      (enc?.href && /image/i.test(enc.type || "") ? enc.href : null);
    const excerpt = desc ? trimWords(desc, 220) : title;
    fetched.push({
      id,
      slug: slugify(title, id),
      title,
      excerpt,
      category: labelCat || primary,
      secondaryCategories: secondary,
      source: (it.origin?.title || "FreshRSS").trim(),
      author: (it.author || it.origin?.title || "").trim(),
      image,
      imageType: image ? "real" : "none",
      aiImage: false,
      readTime: readTimeFrom(excerpt),
      publishedAt: it.published
        ? new Date(it.published * 1000).toISOString()
        : new Date().toISOString(),
      sourceUrl: link,
      guid,
    });
  }
  console.log(`[news] FreshRSS returned ${fetched.length} items`);
  return fetched;
}

// --- Main -----------------------------------------------------------------
async function main() {
  // Use FreshRSS when configured; otherwise (or on failure) the direct feeds.
  let fetched;
  if (FRESHRSS_URL && FRESHRSS_USER && FRESHRSS_API_PASSWORD) {
    fetched = await fetchFromFreshRSS().catch((err) => {
      console.warn(`[news] FreshRSS unavailable (${err.message}) — using direct feeds`);
      return fetchFromFeeds();
    });
  } else {
    fetched = await fetchFromFeeds();
  }

  // Merge with the existing archive so nothing is ever lost. New id = new story.
  const existingArchive = readJson(ARCHIVE_PATH)?.items ?? [];
  const byId = new Map();
  for (const it of existingArchive) byId.set(it.id, it);
  let newCount = 0;
  for (const it of fetched) {
    if (byId.has(it.id)) {
      // keep the earliest record but refresh the image if we now have one
      const prev = byId.get(it.id);
      if (!prev.image && it.image) { prev.image = it.image; prev.imageType = "real"; }
    } else {
      byId.set(it.id, it);
      newCount += 1;
    }
  }

  // Sort newest-first and apply retention.
  const cutoff = Date.now() - ARCHIVE_DAYS * 86_400_000;
  let all = [...byId.values()]
    .filter((it) => new Date(it.publishedAt).getTime() >= cutoff || !it.publishedAt)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Translate the current window (reusing cached Hindi where possible).
  const cache = buildTranslationCache();
  const current = all.slice(0, CURRENT_ITEMS);
  console.log(`[news] ${all.length} total (${newCount} new); translating current window…`);
  for (const it of current) {
    it.titleHi = cache.get(`t:${it.id}`) || (await translateHi(it.title)) || it.title;
    if (it.titleHi !== it.title) await sleep(200);
    it.excerptHi = cache.get(`e:${it.id}`) || (await translateHi(it.excerpt)) || it.excerpt;
    if (it.excerptHi !== it.excerpt) await sleep(200);
    it.archived = false;
  }
  // Preserve any Hindi already stored for archived items; default to English.
  for (const it of all.slice(CURRENT_ITEMS)) {
    it.titleHi = it.titleHi || cache.get(`t:${it.id}`) || it.title;
    it.excerptHi = it.excerptHi || cache.get(`e:${it.id}`) || it.excerpt;
    it.archived = true;
  }

  const now = new Date().toISOString();
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(
    CURRENT_PATH,
    JSON.stringify(
      { generatedAt: now, source: "euroconnect-rss-aggregator", feedCount: FEEDS.length, total: current.length, items: current },
      null, 2
    ) + "\n"
  );
  writeFileSync(
    ARCHIVE_PATH,
    JSON.stringify(
      { generatedAt: now, retentionDays: ARCHIVE_DAYS, total: all.length, items: all },
      null, 2
    ) + "\n"
  );

  // Location-aware homepage lead: the newest India + Europe stories from the
  // full corpus, pre-computed here so the homepage shows local news WITHOUT
  // importing the heavy archive.json into its bundle.
  const INDIA_RE = /\b(india|indian|indians|delhi|mumbai|modi|rupee|bollywood|bengaluru|gujarat|kolkata|hyderabad)\b/i;
  const indiaLocal = all
    .filter((x) => INDIA_RE.test(`${x.title || ""} ${x.excerpt || ""}`))
    .slice(0, 10);
  const europeLocal = all
    .filter((x) => (x.category || "").toLowerCase() === "europe")
    .slice(0, 10);
  // Global section for visitors outside India/Europe (US, Asia, Africa, …).
  const worldLocal = all
    .filter((x) => (x.category || "").toLowerCase() === "world")
    .slice(0, 10);
  writeFileSync(
    LOCAL_PATH,
    JSON.stringify(
      { generatedAt: now, india: indiaLocal, europe: europeLocal, world: worldLocal },
      null,
      2
    ) + "\n"
  );

  // Best-effort: pre-warm the on-demand AI illustrations (for stories with no
  // usable source image) so they load instantly and reliably for visitors.
  // Pollinations rate-limits concurrency, so warm SEQUENTIALLY. Never fatal.
  try {
    await warmAiImages([...current, ...indiaLocal, ...europeLocal, ...worldLocal]);
  } catch (e) {
    console.warn("[news] AI warm skipped:", e.message);
  }

  const translated = current.filter((i) => i.titleHi !== i.title).length;
  console.log(
    `[news] wrote ${current.length} current + ${all.length} archived (${newCount} new, ${translated} Hindi) `
  );
}

// --- AI illustration warming (mirrors src/lib/mock-data.ts) --------------------
function aiTooSmall(url) {
  const m = url && url.match(/[?&]width=(\d+)/i);
  return m && parseInt(m[1], 10) < 500;
}
function aiImageUrl(item) {
  const prompt =
    `${item.title}. Editorial conceptual illustration for a news website about ${item.category}, ` +
    `clean modern digital art, tasteful, non-photorealistic, no text, no letters, no watermark`;
  let seed = 0;
  for (const ch of String(item.id)) seed = (seed * 31 + ch.charCodeAt(0)) % 1_000_000;
  return (
    "https://image.pollinations.ai/prompt/" +
    encodeURIComponent(prompt) +
    `?width=800&height=500&nologo=true&seed=${seed}&model=flux`
  );
}
async function warmAiImages(items) {
  const seen = new Set();
  const targets = [];
  for (const it of items) {
    if (!it || !it.id || seen.has(it.id)) continue;
    seen.add(it.id);
    if (!it.image || aiTooSmall(it.image)) targets.push(aiImageUrl(it));
    if (targets.length >= 40) break;
  }
  if (!targets.length) return;
  console.log(`[news] warming ${targets.length} AI illustrations (sequential)…`);
  let ok = 0;
  for (const url of targets) {
    for (let a = 1; a <= 3; a++) {
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 45000);
        const r = await fetch(url, { signal: ctl.signal });
        clearTimeout(t);
        if (r.ok) { await r.arrayBuffer(); ok++; break; }
        if (r.status === 429) { await new Promise((x) => setTimeout(x, 4000 * a)); continue; }
        break;
      } catch {
        await new Promise((x) => setTimeout(x, 2500 * a));
      }
    }
  }
  console.log(`[news] warmed ${ok}/${targets.length} AI illustrations`);
}

// Run the full pipeline only when executed directly (not when imported by tests).
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((err) => {
    console.error("[news] fatal:", err);
    process.exit(1);
  });
}

export { fetchFromFreshRSS, fetchFromFeeds };
