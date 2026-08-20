// Verifies the FreshRSS (GReader API) adapter without a live FreshRSS server:
// spins up a mock that returns a realistic GReader ClientLogin + stream/contents
// response, points the adapter at it, and asserts the mapping is correct.
//
// Run: node scripts/test-freshrss.mjs
import http from "node:http";

const PUBLISHED = 1734512400; // fixed unix seconds
const SAMPLE = {
  items: [
    {
      id: "tag:google.com,2005:reader/item/00000000abcd1234",
      title: "EU leaders agree new migration and border framework",
      published: PUBLISHED,
      canonical: [{ href: "https://example.org/world/eu-migration-framework" }],
      alternate: [{ href: "https://example.org/world/eu-migration-framework" }],
      categories: [
        "user/-/state/com.google/reading-list",
        "user/-/label/Europe",
      ],
      summary: {
        content:
          '<p><img src="https://img.example.org/eu.jpg" alt="EU"/>Brussels — European Union leaders reached agreement on a new framework governing migration and external borders after talks.</p>',
      },
      origin: { title: "Euronews", streamId: "feed/https://euronews.com/rss" },
      author: "Euronews Staff",
      enclosure: [{ href: "https://img.example.org/enc.jpg", type: "image/jpeg" }],
    },
    {
      id: "tag:google.com,2005:reader/item/00000000ef567890",
      title: "Bitcoin rallies as institutional inflows hit record",
      published: PUBLISHED - 3600,
      canonical: [{ href: "https://example.org/crypto/bitcoin-inflows" }],
      categories: ["user/-/label/Crypto"],
      summary: { content: "<p>Digital-asset funds saw record weekly inflows as bitcoin climbed.</p>" },
      origin: { title: "CoinDesk" },
    },
  ],
};

function startMock() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url.includes("/accounts/ClientLogin")) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("SID=mocksid\nLSID=mocklsid\nAuth=MOCKTOKEN\n");
        return;
      }
      if (req.url.includes("/stream/contents/")) {
        const auth = req.headers["authorization"] || "";
        if (!auth.includes("MOCKTOKEN")) {
          res.writeHead(401);
          res.end("unauthorized");
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(SAMPLE));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

const server = await startMock();
const { port } = server.address();
process.env.FRESHRSS_URL = `http://127.0.0.1:${port}`;
process.env.FRESHRSS_USER = "tester";
process.env.FRESHRSS_API_PASSWORD = "secret";

const { fetchFromFreshRSS } = await import("./fetch-news.mjs");
const items = await fetchFromFreshRSS();
server.close();

const a = items[0];
const checks = {
  count: items.length === 2,
  title: a.title === "EU leaders agree new migration and border framework",
  categoryFromLabel: a.category === "Europe",
  imageFromContent: a.image === "https://img.example.org/eu.jpg",
  imageTypeReal: a.imageType === "real",
  publishedAtFromUnix: a.publishedAt === new Date(PUBLISHED * 1000).toISOString(),
  sourceUrlIsCanonical: a.sourceUrl === "https://example.org/world/eu-migration-framework",
  guidPreserved: a.guid === "tag:google.com,2005:reader/item/00000000abcd1234",
  hasExcerpt: a.excerpt.length > 20,
  secondItemCategory: items[1].category === "Crypto",
  newestFirstPreserved: new Date(items[0].publishedAt) >= new Date(items[1].publishedAt),
};

console.log("FreshRSS adapter mapping:");
for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? "PASS" : "FAIL"}  ${k}`);
const failed = Object.entries(checks).filter(([, v]) => !v);
if (failed.length) {
  console.error("\nFAILED:", failed.map(([k]) => k).join(", "));
  process.exit(1);
}
console.log("\nAll FreshRSS adapter checks passed.");
