# Euro Connect News — News Pipeline (RSS/Atom only)

This project's news comes **exclusively from public RSS/Atom feeds**. There is
**no news API** and **no API key** anywhere in the codebase — verified: no
NewsAPI, GNews, Bing News, Google News API, `api_key`, `bearer`, or `x-api-key`.
This is the same RSS-aggregation role a self-hosted FreshRSS instance plays.

## Architecture

```
RSS / ATOM FEEDS
      ↓
scripts/fetch-news.mjs   (aggregate → classify → dedupe → translate)
      ↓
src/data/generated-news.json   (current window, newest-first)
src/data/archive.json          (persistent history — never overwritten)
      ↓
src/lib/mock-data.ts + src/lib/archive.ts   (read the JSON)
      ↓
Euro Connect News frontend (UNCHANGED) → hero, ticker, cards, categories, search
```

The **frontend/design is never touched** by the news layer — components only read
the two JSON files. Swapping the source (e.g. to a hosted FreshRSS GReader API)
would only change `scripts/fetch-news.mjs`, not any UI.

## Configuring feeds & categories (the "FreshRSS feeds" equivalent)

Edit the `FEEDS` array in [`scripts/fetch-news.mjs`](../scripts/fetch-news.mjs).
Each entry is a feed URL + its source name + primary category:

```js
{ url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC", category: "World" },
```

Configured categories (each has live feeds): **World, Europe, Politics, Business,
Technology, Science, Culture, Sports, Crypto, Opinion.** `India`, `Health` and
`Visa` are keyword views over the same corpus (see `src/lib/archive.ts`). World
and Europe are classified by geography so both always contain real news.

Add a feed → add a line to `FEEDS`. Remove a feed → delete its line. Nothing
else needs to change.

## How the requirements are met

| Requirement | Where |
|---|---|
| RSS/Atom only, no API, no keys | `scripts/fetch-news.mjs` (feeds + MyMemory translation only) |
| New stories appear, newest first | current window sorted by `publishedAt` desc |
| Previous stories stay accessible | `archive.json` merged, 45-day retention, `/archive` page |
| No duplicates | stable id = SHA-1 of canonical URL, deduped across runs |
| Publication date/time preserved | `publishedAt` from the feed item |
| Category filtering | `getCategoryArticles()` in `src/lib/archive.ts` |
| Breaking ticker data | newest headlines → `src/components/breaking-ticker.tsx` |
| Hero / cards data | `articles` from `mock-data.ts` |
| Article page | `/article/[slug]` shows title/summary/source/time + link to source |
| Search (current + archive) | `getSearchCorpus()` in `src/lib/archive.ts` |
| English / Hindi | `titleHi`/`excerptHi` produced at generation time |
| No full copyrighted text | only title/summary/link stored; links back to source |
| Auto-update | `.github/workflows/update-news.yml` (cron, every 2h) |

## FreshRSS as the aggregation layer (built-in, opt-in)

`scripts/fetch-news.mjs` has **two interchangeable sources**, chosen at runtime:

- **Direct feeds** (default) — parses the `FEEDS` list with `rss-parser`.
- **FreshRSS** — when `FRESHRSS_URL` + `FRESHRSS_USER` + `FRESHRSS_API_PASSWORD`
  are set, it logs into your hosted **FreshRSS** instance via the **Google Reader
  API** (`/api/greader.php`), reads the reading-list, and maps each item into the
  exact same shape (GUID-based dedup, real `published` timestamp, image from the
  item's media/content, category from the FreshRSS **folder label**). If FreshRSS
  is unreachable it automatically falls back to direct feeds, so the site never
  goes stale. Verified by `scripts/test-freshrss.mjs` (mock GReader server).

Everything downstream (archive merge, dedup, Hindi, the whole frontend) is
identical either way — **no UI change**.

### Why FreshRSS adds value
FreshRSS aggregates feeds **server-side on a schedule and supports WebSub
(PubSubHubbub)** — so feeds that offer a hub push updates to FreshRSS instantly,
and this script simply reads FreshRSS's already-fresh items. WebSub is handled by
FreshRSS itself; nothing extra is needed here.

### To turn it on
1. Host FreshRSS (Docker/VPS/shared PHP host). In its UI, create your feeds and
   put them in **folders named exactly** `World`, `Europe`, `Politics`,
   `Business`, `Technology`, `Science`, `Culture`, `Sports`, `Crypto`, `Opinion`.
2. Enable the API (Settings → Authentication → "Allow API access") and set an
   **API password**.
3. In your GitHub repo → Settings → Secrets → Actions, add:
   `FRESHRSS_URL` (e.g. `https://rss.yourdomain.com`), `FRESHRSS_USER`,
   `FRESHRSS_API_PASSWORD`.

The scheduled Action then pulls from FreshRSS on every run.

## Security

Feeds are public, so the default path needs no credentials. FreshRSS credentials
live **only** in GitHub Action secrets and are used server-side during generation
— they are **never** placed in the browser bundle or any client JS.
