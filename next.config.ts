import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // News images come from many, changing source domains (The Hindu, Guardian,
    // BBC, Euronews, …). Rather than maintain a fragile host allowlist, serve
    // them unoptimised so any https source works and cards never break.
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
