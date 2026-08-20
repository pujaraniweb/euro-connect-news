# Euro Connect News

Bilingual (English / हिंदी) India–Europe news site built with **Next.js (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**. Content is aggregated from public RSS/Atom feeds (no paid news API), with a YouTube archive pulled from the official [@euroconnectnews](https://www.youtube.com/@euroconnectnews) channel.

## Requirements

- Node.js 20+
- npm

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project |
| `npm run fetch-news` | Regenerate news data from public RSS feeds |
| `npm run fetch-youtube` | Refresh the full YouTube archive from the channel |

## Automatic updates

`.github/workflows/update-news.yml` runs every 2 hours, regenerates the news
and YouTube data, and commits the updated JSON — pushing triggers your normal
deploy so the site refreshes itself.

### Optional environment variables (GitHub Action secrets only)

These are **never** exposed to the browser and are optional:

- `MYMEMORY_EMAIL` — raises the free translation quota
- `FRESHRSS_URL`, `FRESHRSS_USER`, `FRESHRSS_API_PASSWORD` — pull news from a
  hosted FreshRSS instance instead of fetching feeds directly
- `YT_CHANNEL_ID` — override the YouTube channel id

No API keys are required to run the project locally.

## Project structure

```
src/            App Router pages, components, lib, and data
messages/       en.json / hi.json translations
public/         Logo, icons, service worker
scripts/        Data collectors (news + YouTube)
docs/           Pipeline documentation
```
