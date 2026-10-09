import type { Article } from "./types";
import {
  fromGenerated,
  articles,
  getArticleBySlug as getCurrentBySlug,
  type GeneratedItem,
} from "./mock-data";
import { VIRTUAL_CATEGORIES } from "./categories";

/**
 * The persistent archive, READ AT RUNTIME — deliberately NOT imported.
 *
 * `import archive from "../data/archive.json"` compiled the whole file into the
 * server bundle, and because both this module and the client search bundle
 * pulled it in it landed in TWO ssr chunks. At 3809 items that meant the
 * Cloudflare Worker had to parse ~8.6 MiB of embedded JSON on every cold start;
 * it exceeded the startup budget and threw, taking the entire site down with
 * HTTP 500 / error 1101 on 2026-10-09. Fetching it instead keeps the archive
 * out of the bundle entirely, so its size no longer constrains retention.
 *
 * The data is the same file the hourly Action commits — raw.githubusercontent
 * serves it with a 5-minute cache, so this also means a data push reaches the
 * site without waiting for a rebuild.
 */
const ARCHIVE_URL =
  "https://raw.githubusercontent.com/pujaraniweb/euro-connect-news/main/src/data/archive.json";

/** Upstream sets max-age=300; match it so we never hammer raw.githubusercontent. */
const TTL_MS = 5 * 60 * 1000;

type Cache = { at: number; items: Article[] };
let cache: Cache | null = null;
let inflight: Promise<Article[]> | null = null;

async function load(): Promise<Article[]> {
  const res = await fetch(ARCHIVE_URL, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`archive HTTP ${res.status}`);
  const json = (await res.json()) as { items?: GeneratedItem[] };
  const items = (json.items ?? []).map((it) => fromGenerated(it));
  if (items.length === 0) throw new Error("archive returned no items");
  return items;
}

/**
 * The archive (newest first). Falls back to the current window — which is small
 * and still bundled — if the fetch fails, so a GitHub outage degrades the depth
 * of these pages rather than emptying them.
 */
export async function getArchivedArticles(): Promise<Article[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;
  // Collapse concurrent requests on a cold isolate into one upstream fetch.
  if (!inflight) {
    inflight = load()
      .then((items) => {
        cache = { at: Date.now(), items };
        return items;
      })
      .catch(() => articles)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** De-duplicated corpus of every article (current + archived), newest first. */
export async function getSearchCorpus(): Promise<Article[]> {
  const archived = await getArchivedArticles();
  const byId = new Map<string, Article>();
  for (const a of [...articles, ...archived]) byId.set(a.id, a);
  return [...byId.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Distinct sources present across the archive. */
export async function allSources(): Promise<string[]> {
  const archived = await getArchivedArticles();
  return [...new Set(archived.map((a) => a.source))].sort();
}

/**
 * All articles in a category (current + archive), newest first, so every navbar
 * category has content — not just the current window. Category names are
 * normalised (case-insensitive) before filtering.
 */
export async function getCategoryArticles(category: string): Promise<Article[]> {
  const slug = category.trim().toLowerCase();
  const corpus = await getSearchCorpus();
  const re = VIRTUAL_CATEGORIES[slug];
  if (re) return corpus.filter((a) => re.test(`${a.title} ${a.excerpt}`));
  return corpus.filter((a) => a.category.toLowerCase() === slug);
}

/** Find an article by slug across current news AND the archive. */
export async function findArticle(slug: string): Promise<Article | undefined> {
  const current = getCurrentBySlug(slug);
  if (current) return current;
  const archived = await getArchivedArticles();
  return archived.find((a) => a.slug === slug);
}
