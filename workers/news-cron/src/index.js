/**
 * Euro Connect News — hourly news-refresh trigger.
 *
 * GitHub's `schedule:` trigger is explicitly best-effort: for this repository it
 * fired only 3-8 times a day instead of 24, which is why the live site went
 * stale for 2-17 hours at a stretch. Cloudflare's Cron Triggers are dependable,
 * so this Worker presses the button on GitHub's behalf once an hour by creating
 * a `workflow_dispatch` run of the EXISTING workflow.
 *
 * It changes nothing about how news is fetched. The workflow it dispatches is
 * the same one GitHub's schedule already runs.
 *
 * Security posture:
 *   - No `fetch` handler and no routes => no public HTTP surface.
 *   - The token is read only from `env.GITHUB_TOKEN` (a Cloudflare secret) and
 *     is never logged, echoed, or returned.
 *   - Owner/repo/workflow/ref are hardcoded constants below, so this Worker can
 *     only ever dispatch that one workflow in that one repository.
 */

// Hardcoded so a misconfigured variable can never retarget this at another repo.
const OWNER = "pujaraniweb";
const REPO = "euro-connect-news";
const WORKFLOW = "update-news.yml"; // workflow id 338317764
const REF = "main";

const ENDPOINT =
  `https://api.github.com/repos/${OWNER}/${REPO}` +
  `/actions/workflows/${WORKFLOW}/dispatches`;

export default {
  /**
   * The only entry point. Cloudflare invokes this on the cron in wrangler.toml.
   */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(dispatchWorkflow(env, event));
  },
};

async function dispatchWorkflow(env, event) {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    // Never say anything about the value — only that it is absent.
    console.error(
      "[news-cron] GITHUB_TOKEN secret is not set; nothing dispatched. " +
        "Run: wrangler secret put GITHUB_TOKEN"
    );
    return;
  }

  const firedAt = new Date(event?.scheduledTime ?? Date.now()).toISOString();

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // GitHub rejects API requests that send no User-Agent.
        "User-Agent": "ecn-news-cron",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: REF }),
    });

    // A successful dispatch is 204 No Content. Anything else is a real problem
    // worth surfacing in `wrangler tail`.
    if (res.status === 204) {
      console.log(
        `[news-cron] ${firedAt} dispatched ${WORKFLOW} on ${REF} (HTTP 204)`
      );
      return;
    }

    // GitHub's error bodies describe the failure (e.g. "Resource not accessible
    // by personal access token" when the PAT lacks Actions:write, or 404 when it
    // cannot see the repo). They never echo the Authorization header, but the
    // slice keeps it bounded regardless.
    const detail = await res.text().then(
      (t) => t.slice(0, 200),
      () => ""
    );
    console.error(
      `[news-cron] ${firedAt} dispatch FAILED: HTTP ${res.status} ${detail}`
    );
  } catch (err) {
    console.error(
      `[news-cron] ${firedAt} dispatch ERROR: ${err?.name}: ${err?.message}`
    );
  }
}
