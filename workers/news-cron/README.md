# ecn-news-cron

A Cloudflare Worker whose only job is to trigger the existing
[`update-news.yml`](../../.github/workflows/update-news.yml) workflow once an
hour.

## Why this exists

GitHub's `schedule:` trigger is best-effort, not guaranteed. Measured over 100
runs of this repository's workflow, it fired **3-8 times a day instead of 24**,
and 37 of those runs were cancelled — so fresh news reached the live site every
2-17 hours. Cloudflare's Cron Triggers are dependable, so this Worker creates a
`workflow_dispatch` run on the hour.

It does **not** fetch or process news. It presses the same button GitHub's
schedule already presses, just reliably.

```
Cloudflare cron "0 * * * *"
   -> Worker scheduled() handler
   -> POST /repos/pujaraniweb/euro-connect-news/actions/workflows/update-news.yml/dispatches
   -> existing workflow: fetch-news -> fetch-youtube -> commit -> push
   -> Cloudflare builds the site (~3 min) -> live
```

## Security

- **No public HTTP surface.** There is no `fetch` handler and no route, and
  `workers_dev = false`, so nothing can invoke this except the cron.
- **The token is a Cloudflare secret**, read only as `env.GITHUB_TOKEN`. It is
  never written to `wrangler.toml`, this README, the repository, or any log line.
- **Single target.** Owner, repo, workflow filename and ref are hardcoded
  constants in `src/index.js`, so this Worker cannot be pointed anywhere else.
- Logs contain only a timestamp, the HTTP status, and GitHub's own error text
  (truncated to 200 characters).

## One-time setup

### 1. Create the GitHub token

Create a **fine-grained** personal access token at
<https://github.com/settings/personal-access-tokens/new>:

| Field | Value |
| --- | --- |
| Resource owner | `pujaraniweb` |
| Repository access | **Only select repositories** -> `euro-connect-news` |
| Repository permissions | **Actions: Read and write** — this one only |
| Expiration | 90 days (see *Rotation* below) |

`Actions: Read and write` is the minimum `workflow_dispatch` accepts. Do not use
a classic token: the equivalent scopes (`repo` + `workflow`) grant write access
to *every* repository you own.

### 2. Store it as a Worker secret

From this directory (`workers/news-cron`):

```bash
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
```

Paste the token at the prompt. It is encrypted at rest and cannot be read back —
not through the dashboard, not through the API, not by this Worker's author.

### 3. Deploy

```bash
npx wrangler deploy
```

## Testing

**Locally, before deploying** — run the scheduled handler on demand:

```bash
npx wrangler dev --test-scheduled
```

then, in another terminal:

```bash
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

Expect `[news-cron] ... dispatched update-news.yml on main (HTTP 204)`. A new
run appears in the repository's Actions tab within seconds.

**In production** — watch live invocations:

```bash
npx wrangler tail ecn-news-cron
```

**Ground truth** — the Worker's own logs are not proof the pipeline improved.
Check GitHub instead: dispatched runs are labelled `workflow_dispatch`, distinct
from the unreliable `schedule` ones.

```bash
curl -s "https://api.github.com/repos/pujaraniweb/euro-connect-news/actions/workflows/update-news.yml/runs?per_page=30" \
  | grep -o '"event": "[a-z_]*"' | sort | uniq -c
```

After a few hours there should be a clean hourly sequence of `workflow_dispatch`
runs.

## Notes

- The workflow's own `schedule:` trigger is **still enabled**. Both triggers
  coexist safely: the workflow's `concurrency: update-news` group with
  `cancel-in-progress: false` queues an overlapping run rather than colliding.
  Once the hourly Worker is verified, the `schedule:` line can be removed to
  avoid duplicate runs.
- Hourly success means roughly 24 site builds a day (~1,440 build-minutes a
  month against Cloudflare's 3,000 free). That is the ceiling to keep in mind if
  a sub-hourly cadence is ever wanted — at that point the data needs to be read
  at runtime instead of bundled into the build.

## Rotation

The fine-grained token expires. When it does, dispatches start failing with
`HTTP 401` and the site silently goes stale again — the same failure mode this
Worker was built to fix. Create a replacement token with the same single
permission and re-run `npx wrangler secret put GITHUB_TOKEN`; no redeploy is
needed. Setting a calendar reminder a few days before expiry is worthwhile.
