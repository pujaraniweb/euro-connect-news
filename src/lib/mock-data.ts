import type { Article, Category, MarketQuote } from "./types";
import generated from "../data/generated-news.json";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

/**
 * Curated fallback content. Used only if the aggregator has produced no items
 * yet (e.g. before the first GitHub Action run), so the site never renders empty.
 */
const seedArticles: Article[] = [
  {
    id: "1",
    slug: "eu-india-trade-summit-brussels-2026",
    title:
      "EU and India seal landmark free-trade agreement after nine years of talks",
    excerpt:
      "The deal slashes tariffs on autos, wine and pharmaceuticals and opens Europe's services market to Indian firms, in a signal both blocs want to de-risk from China.",
    titleHi:
      "नौ साल की बातचीत के बाद यूरोपीय संघ और भारत ने ऐतिहासिक मुक्त-व्यापार समझौते पर मुहर लगाई",
    excerptHi:
      "यह समझौता ऑटो, वाइन और दवाओं पर शुल्क घटाता है और भारतीय कंपनियों के लिए यूरोप का सेवा बाज़ार खोलता है — यह संकेत कि दोनों गुट चीन पर निर्भरता घटाना चाहते हैं।",
    category: "Business",
    tags: ["Trade", "EU-India", "Tariffs", "Diplomacy"],
    source: "Reuters",
    author: "Meera Krishnan",
    imageSeed: "trade-summit",
    readTime: 6,
    publishedAt: minutesAgo(18),
    isBreaking: true,
    featured: true,
  },
  {
    id: "2",
    slug: "germany-skilled-worker-visa-india-expansion",
    title:
      "Germany triples skilled-worker visa quota for Indian professionals",
    excerpt:
      "Berlin's new Opportunity Card rules take effect next month, cutting processing to six weeks for IT and healthcare workers from India.",
    titleHi:
      "जर्मनी ने भारतीय पेशेवरों के लिए कुशल-कामगार वीज़ा कोटा तीन गुना किया",
    excerptHi:
      "बर्लिन के नए ‘अवसर कार्ड’ नियम अगले महीने लागू होंगे, जिससे भारत के आईटी और स्वास्थ्य-कर्मियों के लिए प्रक्रिया घटकर छह सप्ताह रह जाएगी।",
    category: "India",
    tags: ["Visa", "Germany", "Jobs", "Migration"],
    source: "DW",
    author: "Jonas Weber",
    imageSeed: "berlin-visa",
    readTime: 4,
    publishedAt: minutesAgo(52),
    isLive: true,
  },
  {
    id: "3",
    slug: "eur-inr-record-remittance-corridor",
    title:
      "Euro slips against rupee as €18bn remittance corridor comes into focus",
    excerpt:
      "Analysts say a stronger rupee is reshaping how the Indian diaspora in Europe sends money home, with fintechs racing to cut fees.",
    titleHi:
      "€18 अरब के धन-प्रेषण गलियारे पर नज़र के बीच रुपये के मुक़ाबले यूरो कमज़ोर",
    excerptHi:
      "विश्लेषकों का कहना है कि मज़बूत रुपया यह बदल रहा है कि यूरोप में बसे भारतीय घर पैसे कैसे भेजते हैं, और फिनटेक कंपनियाँ शुल्क घटाने की होड़ में हैं।",
    category: "Business",
    tags: ["Currency", "Remittances", "EUR/INR", "Fintech"],
    source: "Bloomberg",
    author: "Priya Nair",
    imageSeed: "currency",
    readTime: 5,
    publishedAt: minutesAgo(96),
  },
  {
    id: "4",
    slug: "indian-students-record-numbers-netherlands",
    title:
      "Dutch universities report record Indian enrolment amid UK fee squeeze",
    excerpt:
      "The Netherlands has overtaken the UK as the fastest-growing destination for Indian postgraduates, new admissions data shows.",
    titleHi:
      "ब्रिटेन में फ़ीस दबाव के बीच डच विश्वविद्यालयों में भारतीय दाखिलों का रिकॉर्ड",
    excerptHi:
      "नए दाख़िला आँकड़ों के अनुसार, भारतीय स्नातकोत्तर छात्रों के लिए नीदरलैंड ब्रिटेन को पीछे छोड़कर सबसे तेज़ी से बढ़ता गंतव्य बन गया है।",
    category: "Europe",
    tags: ["Students", "Netherlands", "Education"],
    source: "Euronews",
    author: "Sanne de Vries",
    imageSeed: "students",
    readTime: 4,
    publishedAt: minutesAgo(140),
  },
  {
    id: "5",
    slug: "diwali-london-trafalgar-square-2026",
    title:
      "London's Trafalgar Square Diwali draws record 90,000 as mayor pledges funding",
    excerpt:
      "Europe's largest Diwali celebration returns bigger than ever, underscoring the cultural weight of the 1.9-million-strong British Indian community.",
    titleHi:
      "लंदन के ट्रफ़ाल्गर स्क्वायर की दिवाली में रिकॉर्ड 90,000 लोग, मेयर ने फंडिंग का वादा किया",
    excerptHi:
      "यूरोप का सबसे बड़ा दिवाली समारोह पहले से भी बड़े रूप में लौटा, जो 19 लाख की ब्रिटिश-भारतीय आबादी के सांस्कृतिक महत्व को रेखांकित करता है।",
    category: "Culture",
    tags: ["Diwali", "London", "Diaspora", "Festival"],
    source: "The Guardian",
    author: "Anita Sharma",
    imageSeed: "diwali",
    readTime: 3,
    publishedAt: minutesAgo(210),
  },
  {
    id: "6",
    slug: "tata-motors-jaguar-electric-plant-spain",
    title:
      "Tata unveils €4bn electric-vehicle gigafactory in Spain, creating 3,000 jobs",
    excerpt:
      "The Indian conglomerate picks Valencia over rival European sites, deepening industrial ties between the two economies.",
    titleHi:
      "टाटा ने स्पेन में €4 अरब की इलेक्ट्रिक-वाहन गिगाफैक्ट्री की घोषणा की, 3,000 नौकरियाँ",
    excerptHi:
      "भारतीय समूह ने प्रतिद्वंद्वी यूरोपीय स्थलों के बजाय वालेंसिया को चुना, जिससे दोनों अर्थव्यवस्थाओं के औद्योगिक संबंध और गहरे हुए।",
    category: "Technology",
    tags: ["EV", "Tata", "Spain", "Manufacturing"],
    source: "Financial Times",
    author: "Carlos Mendez",
    imageSeed: "gigafactory",
    readTime: 5,
    publishedAt: minutesAgo(305),
  },
  {
    id: "7",
    slug: "india-france-defence-rafale-marine",
    title:
      "India finalises Rafale-Marine jet deal with France in €7bn agreement",
    excerpt:
      "The naval fighter purchase cements a strategic partnership as both nations expand cooperation in the Indo-Pacific.",
    titleHi:
      "भारत ने फ्रांस के साथ €7 अरब के राफेल-मरीन जेट सौदे को अंतिम रूप दिया",
    excerptHi:
      "नौसैनिक लड़ाकू विमानों की यह खरीद रणनीतिक साझेदारी को मज़बूत करती है, क्योंकि दोनों देश हिंद-प्रशांत में सहयोग बढ़ा रहे हैं।",
    category: "Politics",
    tags: ["Defence", "France", "Rafale", "Indo-Pacific"],
    source: "Le Monde",
    author: "Élodie Rousseau",
    imageSeed: "defence",
    readTime: 6,
    publishedAt: minutesAgo(420),
  },
  {
    id: "8",
    slug: "premier-league-india-broadcast-rights",
    title:
      "Premier League lands record India broadcast deal worth £320m",
    excerpt:
      "Football's global expansion leans on India's booming appetite for European sport, with streaming numbers up 40% year on year.",
    titleHi:
      "प्रीमियर लीग को भारत में £320 मिलियन का रिकॉर्ड प्रसारण सौदा मिला",
    excerptHi:
      "फ़ुटबॉल का वैश्विक विस्तार यूरोपीय खेलों के लिए भारत की बढ़ती दीवानगी पर टिका है, स्ट्रीमिंग के आँकड़े साल-दर-साल 40% बढ़े।",
    category: "Sports",
    tags: ["Football", "Broadcast", "Premier League"],
    source: "BBC",
    author: "Tom Fletcher",
    imageSeed: "football",
    readTime: 3,
    publishedAt: minutesAgo(560),
  },
  {
    id: "9",
    slug: "eu-digital-rules-indian-startups",
    title:
      "New EU digital rules force Indian startups to rethink Europe strategy",
    excerpt:
      "Compliance costs are rising, but founders say access to 450 million consumers still makes the European market worth the paperwork.",
    titleHi:
      "यूरोपीय संघ के नए डिजिटल नियमों से भारतीय स्टार्टअप्स को यूरोप रणनीति पर पुनर्विचार",
    excerptHi:
      "अनुपालन लागत बढ़ रही है, पर संस्थापकों का कहना है कि 45 करोड़ उपभोक्ताओं तक पहुँच से यूरोपीय बाज़ार यह कागज़ी कार्रवाई सार्थक बना देता है।",
    category: "Technology",
    tags: ["Startups", "Regulation", "EU", "Tech"],
    source: "Reuters",
    author: "Rahul Desai",
    imageSeed: "startups",
    readTime: 5,
    publishedAt: minutesAgo(700),
  },
  {
    id: "10",
    slug: "world-climate-summit-india-eu-green",
    title:
      "India and EU launch joint €2bn green-hydrogen fund at climate summit",
    excerpt:
      "The partnership aims to scale clean-energy exports and position both blocs as leaders in the hydrogen economy.",
    titleHi:
      "जलवायु शिखर सम्मेलन में भारत और यूरोपीय संघ ने संयुक्त €2 अरब का हरित-हाइड्रोजन कोष शुरू किया",
    excerptHi:
      "इस साझेदारी का लक्ष्य स्वच्छ-ऊर्जा निर्यात बढ़ाना और दोनों गुटों को हाइड्रोजन अर्थव्यवस्था में अग्रणी के रूप में स्थापित करना है।",
    category: "World",
    tags: ["Climate", "Hydrogen", "Energy", "Summit"],
    source: "Al Jazeera",
    author: "Fatima Noor",
    imageSeed: "climate",
    readTime: 4,
    publishedAt: minutesAgo(880),
  },
  {
    id: "11",
    slug: "italy-indian-agriculture-workers-rights",
    title:
      "Italy overhauls seasonal-worker rules after diaspora rights campaign",
    excerpt:
      "Reforms follow years of advocacy by Punjabi farm communities in the Po Valley, a quiet cornerstone of Italian agriculture.",
    titleHi:
      "प्रवासी अधिकार अभियान के बाद इटली ने मौसमी-कामगार नियमों में बड़ा बदलाव किया",
    excerptHi:
      "ये सुधार पो घाटी के पंजाबी किसान समुदायों की वर्षों की पैरवी के बाद आए हैं, जो इतालवी कृषि की एक ख़ामोश रीढ़ हैं।",
    category: "Europe",
    tags: ["Labour", "Italy", "Rights", "Diaspora"],
    source: "Euronews",
    author: "Giulia Ferrari",
    imageSeed: "agriculture",
    readTime: 5,
    publishedAt: minutesAgo(1010),
  },
  {
    id: "12",
    slug: "sensex-nifty-europe-fund-inflows",
    title:
      "Indian equities rally as European funds pour record inflows into Mumbai",
    excerpt:
      "The Sensex touches a fresh high as portfolio managers in Frankfurt and Amsterdam rotate out of slowing Western markets.",
    titleHi:
      "यूरोपीय फंडों के रिकॉर्ड निवेश से भारतीय शेयरों में तेज़ी, मुंबई बाज़ार चढ़ा",
    excerptHi:
      "सेंसेक्स नई ऊँचाई पर पहुँचा, क्योंकि फ्रैंकफर्ट और एम्स्टर्डम के पोर्टफ़ोलियो प्रबंधक सुस्त पश्चिमी बाज़ारों से पूँजी हटा रहे हैं।",
    category: "Business",
    tags: ["Markets", "Sensex", "Investment"],
    source: "Bloomberg",
    author: "Priya Nair",
    imageSeed: "markets",
    readTime: 4,
    publishedAt: minutesAgo(1180),
  },
];

const seedBreaking: { en: string; hi: string }[] = [
  {
    en: "EU and India seal landmark free-trade agreement after nine years of talks",
    hi: "नौ साल की बातचीत के बाद यूरोपीय संघ और भारत ने ऐतिहासिक मुक्त-व्यापार समझौते पर मुहर लगाई",
  },
  {
    en: "Germany triples skilled-worker visa quota for Indian professionals",
    hi: "जर्मनी ने भारतीय पेशेवरों के लिए कुशल-कामगार वीज़ा कोटा तीन गुना किया",
  },
  {
    en: "India finalises €7bn Rafale-Marine jet deal with France",
    hi: "भारत ने फ्रांस के साथ €7 अरब के राफेल-मरीन जेट सौदे को अंतिम रूप दिया",
  },
  {
    en: "Sensex touches record high on European fund inflows",
    hi: "यूरोपीय फंडों के निवेश से सेंसेक्स रिकॉर्ड ऊँचाई पर",
  },
];

// ---------------------------------------------------------------------------
// Aggregator adapter: map the generated JSON (from scripts/fetch-news.mjs, kept
// fresh by the GitHub Action) into the Article shape the components already use.
// ---------------------------------------------------------------------------
export interface GeneratedItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  titleHi: string;
  excerptHi: string;
  category: string;
  secondaryCategories?: string[];
  source: string;
  author: string;
  image: string | null;
  imageType?: "real" | "ai" | "none";
  aiImage: boolean;
  readTime: number;
  publishedAt: string;
  sourceUrl: string;
  archived?: boolean;
}

export const VALID_CATEGORIES: Category[] = [
  "World", "Europe", "Politics", "Business", "Technology",
  "Science", "Culture", "Sports", "Crypto", "Opinion", "India",
];
const asCategory = (c: string): Category =>
  (VALID_CATEGORIES as string[]).includes(c) ? (c as Category) : "World";

/**
 * The ONLY source name shown anywhere in the UI. Real upstream publishers
 * (BBC, Reuters, …) are kept internally as `originalSource` for attribution/
 * dedup, but never rendered — every visible source label is the brand.
 */
export const DISPLAY_SOURCE = "Euro Connect News";

export function fromGenerated(item: GeneratedItem, index = 0): Article {
  const category = asCategory(item.category);
  const secondary = (item.secondaryCategories ?? [])
    .filter((c) => (VALID_CATEGORIES as string[]).includes(c))
    .map((c) => c as Category);
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    titleHi: item.titleHi,
    excerptHi: item.excerptHi,
    category,
    secondaryCategories: secondary,
    // Publisher name is intentionally NOT added to tags (no "#BBC" chips).
    tags: [category, ...secondary],
    source: DISPLAY_SOURCE,
    originalSource: item.source,
    // Author is branded too: RSS often defaults the byline to the publisher
    // (e.g. "BBC"), which must never be shown. The byline logic then hides it
    // (author === source) so only the Euro Connect News label appears.
    author: DISPLAY_SOURCE,
    // imageUrl() passes absolute http(s) URLs straight through; a non-URL seed
    // falls back to a clean generated image so the card never breaks.
    imageSeed: item.image || `fallback-${item.id.slice(0, 8)}`,
    aiImage: item.aiImage,
    imageType: item.imageType ?? (item.image ? "real" : "none"),
    sourceUrl: item.sourceUrl,
    readTime: item.readTime,
    publishedAt: item.publishedAt,
    archived: item.archived ?? false,
    featured: index === 0,
  };
}

const generatedItems = (generated?.items ?? []) as GeneratedItem[];

/** Current news from the aggregator, or the curated seed if none is available yet.
 *  Seed items are brand-labelled too, so no publisher name is ever displayed. */
export const articles: Article[] =
  generatedItems.length > 0
    ? generatedItems.map(fromGenerated)
    : seedArticles.map((a) => ({
        ...a,
        originalSource: a.source,
        source: DISPLAY_SOURCE,
        author: DISPLAY_SOURCE,
      }));

/** Newest headlines for the breaking-news ticker (bilingual). */
export const breakingHeadlines: { en: string; hi: string }[] =
  generatedItems.length > 0
    ? generatedItems.slice(0, 6).map((i) => ({ en: i.title, hi: i.titleHi }))
    : seedBreaking;

/** When the aggregator last produced data (for honest "updated" labelling). */
export const newsGeneratedAt: string | null = generated?.generatedAt ?? null;

export const markets: MarketQuote[] = [
  { symbol: "SENSEX", name: "BSE Sensex", value: 84213.55, change: 642.18, changePct: 0.77 },
  { symbol: "NIFTY", name: "Nifty 50", value: 25710.9, change: 188.4, changePct: 0.74 },
  { symbol: "EUR/INR", name: "Euro / Rupee", value: 92.84, change: -0.31, changePct: -0.33 },
  { symbol: "GOLD", name: "Gold (10g)", value: 74980, change: 410, changePct: 0.55, currency: "₹" },
  { symbol: "BTC", name: "Bitcoin", value: 98432, change: -1240, changePct: -1.24, currency: "$" },
];

export function getArticles(category?: string): Article[] {
  if (!category || category === "All") return articles;
  if (category === "Breaking") return articles.filter((a) => a.isBreaking);
  return articles.filter((a) => a.category === category);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/**
 * Returns the article's headline + excerpt in the active locale.
 * Both languages are stored on the article itself (no API / translation service).
 */
export function localize(
  article: Article,
  locale: string
): { title: string; excerpt: string } {
  return locale === "hi"
    ? { title: article.titleHi, excerpt: article.excerptHi }
    : { title: article.title, excerpt: article.excerpt };
}

/**
 * Resolve an article image. Real source images (absolute http/https URLs) pass
 * straight through; a plain seed falls back to a clean deterministic image so
 * the card layout never breaks when an article has no usable image.
 */
export function imageUrl(seedOrUrl: string, w = 800, h = 500): string {
  if (/^https?:\/\//.test(seedOrUrl)) return seedOrUrl;
  return `https://picsum.photos/seed/ecn-${seedOrUrl}/${w}/${h}`;
}
