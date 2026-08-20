import data from "@/data/youtube.json";

export interface Video {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  url: string;
  duration?: string | null;
}

/** Channel videos, newest first (from scripts/fetch-youtube.mjs). */
export const videos: Video[] = (data?.items ?? []) as Video[];
export const channelHandle: string = data?.channel ?? "@euroconnectnews";
export const channelUrl: string =
  data?.channelUrl ?? "https://www.youtube.com/@euroconnectnews";
export const youtubeUpdatedAt: string | null = data?.generatedAt ?? null;
