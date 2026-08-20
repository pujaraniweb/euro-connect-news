import type { Metadata } from "next";
import { LiveNews } from "@/components/live-news";

export const metadata: Metadata = {
  title: "Live Updates",
  description:
    "The latest rolling India–Europe headlines from Euro Connect News, refreshed automatically.",
};

export default function LivePage() {
  return <LiveNews />;
}
