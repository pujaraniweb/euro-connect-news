import type { Article } from "./types";
import { articles } from "./mock-data";

/**
 * Mock long-form body for an article, in the active locale. In production this
 * comes from the CMS (Payload); here we synthesise topical paragraphs so the
 * reading experience is representative. Both languages live in this file — no
 * API or translation service.
 */
export function articleBody(a: Article, locale = "en"): string[] {
  if (locale === "hi") {
    return [
      a.excerptHi,
      `यह घटनाक्रम भारत और यूरोप के बीच बदलते रिश्ते में एक उल्लेखनीय पल है। दोनों पक्षों के अधिकारियों ने इसे लगातार कूटनीतिक प्रयासों का नतीजा बताया, और वार्ताकारों ने सार्वजनिक घोषणा से पहले वर्षों की तकनीकी तैयारी की ओर इशारा किया।`,
      `यूरोपीय संघ और ब्रिटेन में रहने वाले लगभग तीस लाख भारतीय मूल के लोगों के लिए इसके व्यावहारिक असर तुरंत हैं। सामुदायिक संगठनों ने लंबे समय से कहा है कि इस क्षेत्र की नीति उन लोगों से दूर बनती है जिन पर इसका असर पड़ता है, और उन्होंने आज की स्पष्टता का स्वागत किया।`,
      `विश्लेषक आगाह करते हैं कि असली परीक्षा अमल की होगी। एक विशेषज्ञ ने कहा, “घोषणा करना आसान हिस्सा है। अब मायने यह रखता है कि यह ढाँचा कितनी जल्दी उन बदलावों में बदले जिन्हें कारोबार और परिवार वास्तव में महसूस कर सकें।”`,
      `${a.category === "Business" ? "वित्तीय बाज़ारों" : "नीति-हलकों"} में प्रतिक्रिया संयमित पर कुल मिलाकर सकारात्मक रही। पर्यवेक्षकों को आने वाले हफ़्तों में और ब्योरे की उम्मीद है, क्योंकि संबंधित मंत्रालय दिशानिर्देश जारी करेंगे और हितधारक सीमा-पार व्यापार, प्रवासन और निवेश पर दीर्घकालिक असर आँकना शुरू करेंगे।`,
      `यूरो कनेक्ट न्यूज़ इस खबर पर नज़र बनाए रखेगा और स्थिति के अनुसार पाठकों को अपडेट देता रहेगा।`,
    ];
  }
  return [
    a.excerpt,
    `The development marks a notable moment in the evolving relationship between India and Europe. Officials on both sides described the outcome as the product of sustained diplomatic engagement, with negotiators pointing to years of technical groundwork that preceded any public announcement.`,
    `For the roughly three million people of Indian origin living across the European Union and the United Kingdom, the practical consequences are immediate. Community organisations have long argued that policy in this space is shaped far from the people it affects, and welcomed the greater clarity that today's news brings.`,
    `Analysts caution that implementation will be the real test. "Announcements are the easy part," one Brussels-based trade specialist noted. "What matters now is how quickly the framework translates into changes that businesses and families can actually feel."`,
    `Reaction in ${a.category === "Business" ? "financial markets" : "policy circles"} was measured but broadly positive. Observers expect further detail in the coming weeks as the relevant ministries publish guidance and stakeholders begin to assess the longer-term implications for cross-border trade, migration and investment.`,
    `Euro Connect News will continue to follow this story and update readers as the situation develops.`,
  ];
}

/** "What you need to know" bullet summary, in the active locale. */
export function articleKeyPoints(a: Article, locale = "en"): string[] {
  if (locale === "hi") {
    return [
      `भारत–यूरोप गलियारे पर सीधा असर डालने वाली ख़बर।`,
      `स्रोत: ${a.source}; ${a.readTime} मिनट का पठन।`,
      a.isBreaking
        ? "विकसित हो रही खबर — पुष्टि होने पर ब्योरे बदल सकते हैं।"
        : "द्विपक्षीय संबंधों की सतत कवरेज का हिस्सा।",
    ];
  }
  return [
    `${a.category} story with direct impact on the India–Europe corridor.`,
    `Reported via ${a.source}; ${a.readTime}-minute read.`,
    a.isBreaking
      ? "Developing story — details may change as more is confirmed."
      : "Part of ongoing coverage of bilateral relations.",
  ];
}

/** Related articles: same category first, then fill from the rest. */
export function getRelated(a: Article, limit = 4): Article[] {
  const sameCat = articles.filter(
    (x) => x.id !== a.id && x.category === a.category
  );
  const others = articles.filter(
    (x) => x.id !== a.id && x.category !== a.category
  );
  return [...sameCat, ...others].slice(0, limit);
}
