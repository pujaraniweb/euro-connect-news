export type Category =
  | "World"
  | "Europe"
  | "Politics"
  | "Business"
  | "Technology"
  | "Science"
  | "Culture"
  | "Sports"
  | "Crypto"
  | "Opinion"
  | "India";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  titleHi: string;
  excerptHi: string;
  category: Category;
  tags: string[];
  source: string;
  author: string;
  imageSeed: string;
  readTime: number; // minutes
  publishedAt: string; // ISO
  isBreaking?: boolean;
  isLive?: boolean;
  featured?: boolean;
  /** True only when the image is AI-generated (shows an "AI Generated" badge). */
  aiImage?: boolean;
  /** How the image was sourced: a real source photo, AI-generated, or none. */
  imageType?: "real" | "ai" | "none";
  /** Additional categories this story also fits (primary stays `category`). */
  secondaryCategories?: Category[];
  /** Canonical link to the original article at the source. */
  sourceUrl?: string;
  /** Real upstream publisher (BBC, Reuters, …). Internal only — never displayed;
   *  the visible `source` label is always the Euro Connect News brand. */
  originalSource?: string;
  /** True when the article has aged out of the current window into the archive. */
  archived?: boolean;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  value: number;
  change: number; // absolute
  changePct: number; // percent
  currency?: string;
}
