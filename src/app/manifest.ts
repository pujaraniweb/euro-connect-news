import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Euro Connect News — India & Europe Daily",
    short_name: "Euro Connect",
    description:
      "Timely, balanced coverage bridging India and Europe: trade, diaspora, visas, markets, politics and culture.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F4",
    theme_color: "#D32F2F",
    orientation: "portrait-primary",
    categories: ["news", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Live Dashboard", url: "/dashboard" },
      { name: "Search", url: "/search" },
    ],
  };
}
