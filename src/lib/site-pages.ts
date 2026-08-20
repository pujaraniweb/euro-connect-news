/**
 * Static company/legal pages linked from the footer. Bilingual content lives
 * here; the /page/[slug] route renders it in the active locale.
 */
export interface SitePage {
  title: { en: string; hi: string };
  intro: { en: string; hi: string };
  body: { en: string; hi: string }[];
}

export const SITE_PAGES: Record<string, SitePage> = {
  about: {
    title: { en: "About Euro Connect News", hi: "यूरो कनेक्ट न्यूज़ के बारे में" },
    intro: {
      en: "Euro Connect News is a focused, independent news platform bridging India and Europe.",
      hi: "यूरो कनेक्ट न्यूज़ भारत और यूरोप को जोड़ने वाला एक केंद्रित, स्वतंत्र समाचार मंच है।",
    },
    body: [
      {
        en: "We automatically aggregate timely, balanced coverage from trusted international sources across World, Europe, Business, Technology, Politics, Culture, Sports and more, and present it in both English and Hindi.",
        hi: "हम विश्व, यूरोप, बिज़नेस, तकनीक, राजनीति, संस्कृति, खेल और अन्य श्रेणियों में विश्वसनीय अंतरराष्ट्रीय स्रोतों से समय पर, संतुलित कवरेज स्वतः एकत्र करते हैं और उसे अंग्रेज़ी व हिंदी दोनों में प्रस्तुत करते हैं।",
      },
      {
        en: "Every article links back to its original source, and older stories are preserved in our searchable archive so nothing is lost when new news arrives.",
        hi: "प्रत्येक लेख अपने मूल स्रोत से जुड़ा होता है, और पुरानी खबरें हमारे खोजने-योग्य पुरालेख में सुरक्षित रहती हैं ताकि नई खबरें आने पर कुछ भी न खोए।",
      },
    ],
  },
  editorial: {
    title: { en: "Editorial Standards", hi: "संपादकीय मानक" },
    intro: {
      en: "Accuracy, independence and transparency guide everything we publish.",
      hi: "सटीकता, स्वतंत्रता और पारदर्शिता हमारे प्रकाशित हर लेख का मार्गदर्शन करती है।",
    },
    body: [
      {
        en: "Stories are sourced from established, reputable outlets and always attributed. We display each item's original source and publication time, and never present AI-generated imagery as a real photograph.",
        hi: "खबरें स्थापित, प्रतिष्ठित माध्यमों से ली जाती हैं और हमेशा श्रेय दिया जाता है। हम प्रत्येक आइटम का मूल स्रोत और प्रकाशन समय दिखाते हैं, और AI-निर्मित चित्रों को कभी वास्तविक तस्वीर के रूप में प्रस्तुत नहीं करते।",
      },
      {
        en: "Corrections are made promptly. If you spot an error, please contact our editorial team.",
        hi: "सुधार तुरंत किए जाते हैं। यदि आपको कोई त्रुटि दिखे, तो कृपया हमारी संपादकीय टीम से संपर्क करें।",
      },
    ],
  },
  contact: {
    title: { en: "Contact Us", hi: "संपर्क करें" },
    intro: {
      en: "We'd love to hear from you.",
      hi: "हम आपसे सुनना चाहेंगे।",
    },
    body: [
      {
        en: "Editorial and general enquiries: editor@euroconnectnews.com. Advertising and partnerships: partners@euroconnectnews.com.",
        hi: "संपादकीय और सामान्य पूछताछ: editor@euroconnectnews.com. विज्ञापन और साझेदारी: partners@euroconnectnews.com.",
      },
      {
        en: "For corrections or takedown requests, include the article link and a short description of the issue.",
        hi: "सुधार या हटाने के अनुरोध के लिए, लेख का लिंक और समस्या का संक्षिप्त विवरण शामिल करें।",
      },
    ],
  },
  privacy: {
    title: { en: "Privacy Policy", hi: "गोपनीयता नीति" },
    intro: {
      en: "We respect your privacy and collect the minimum data needed to run the service.",
      hi: "हम आपकी गोपनीयता का सम्मान करते हैं और सेवा चलाने के लिए न्यूनतम आवश्यक डेटा ही एकत्र करते हैं।",
    },
    body: [
      {
        en: "Reading preferences, bookmarks and your chosen language are stored locally in your browser and are not sent to a server. If you subscribe to our newsletter, we use your email address only to send you updates.",
        hi: "पठन प्राथमिकताएँ, बुकमार्क और आपकी चुनी हुई भाषा आपके ब्राउज़र में स्थानीय रूप से संग्रहीत होती हैं और किसी सर्वर को नहीं भेजी जातीं। यदि आप हमारे न्यूज़लेटर की सदस्यता लेते हैं, तो हम आपके ईमेल पते का उपयोग केवल आपको अपडेट भेजने के लिए करते हैं।",
      },
      {
        en: "We do not sell personal data. You can clear locally stored data at any time from your browser or the Preferences page.",
        hi: "हम व्यक्तिगत डेटा नहीं बेचते। आप अपने ब्राउज़र या प्राथमिकताएँ पृष्ठ से स्थानीय रूप से संग्रहीत डेटा किसी भी समय साफ़ कर सकते हैं।",
      },
    ],
  },
  terms: {
    title: { en: "Terms of Use", hi: "उपयोग की शर्तें" },
    intro: {
      en: "By using Euro Connect News you agree to these terms.",
      hi: "यूरो कनेक्ट न्यूज़ का उपयोग करके आप इन शर्तों से सहमत होते हैं।",
    },
    body: [
      {
        en: "Content is provided for information only, aggregated from third-party sources that retain their own rights. Headlines and summaries link to the original publisher, whom you should consult for the full article.",
        hi: "सामग्री केवल सूचना के लिए दी जाती है, जो तृतीय-पक्ष स्रोतों से एकत्र की जाती है जो अपने अधिकार सुरक्षित रखते हैं। शीर्षक और सारांश मूल प्रकाशक से जुड़े होते हैं, जिनसे पूरे लेख के लिए परामर्श करें।",
      },
      {
        en: "The service is provided on an “as is” basis without warranties. We are not liable for the accuracy of third-party content.",
        hi: "सेवा बिना किसी वारंटी के “जैसी है” के आधार पर प्रदान की जाती है। हम तृतीय-पक्ष सामग्री की सटीकता के लिए उत्तरदायी नहीं हैं।",
      },
    ],
  },
  cookies: {
    title: { en: "Cookie Policy", hi: "कुकी नीति" },
    intro: {
      en: "We keep cookies to a minimum.",
      hi: "हम कुकीज़ को न्यूनतम रखते हैं।",
    },
    body: [
      {
        en: "We use a single cookie to remember your language choice, plus local browser storage for your theme, bookmarks and preferences. We do not use third-party advertising or tracking cookies.",
        hi: "हम आपकी भाषा पसंद याद रखने के लिए एक कुकी का उपयोग करते हैं, साथ ही थीम, बुकमार्क और प्राथमिकताओं के लिए स्थानीय ब्राउज़र स्टोरेज। हम तृतीय-पक्ष विज्ञापन या ट्रैकिंग कुकीज़ का उपयोग नहीं करते।",
      },
    ],
  },
  gdpr: {
    title: { en: "GDPR", hi: "GDPR" },
    intro: {
      en: "Your rights under the EU General Data Protection Regulation.",
      hi: "यूरोपीय संघ के सामान्य डेटा संरक्षण विनियमन (GDPR) के तहत आपके अधिकार।",
    },
    body: [
      {
        en: "You have the right to access, correct or delete any personal data we hold, and to withdraw newsletter consent at any time. Because reading data stays in your browser, you remain in control of it.",
        hi: "आपको हमारे पास मौजूद किसी भी व्यक्तिगत डेटा तक पहुँचने, सुधारने या हटाने और किसी भी समय न्यूज़लेटर सहमति वापस लेने का अधिकार है। चूँकि पठन-डेटा आपके ब्राउज़र में रहता है, आप उस पर नियंत्रण रखते हैं।",
      },
      {
        en: "To exercise any GDPR right, email privacy@euroconnectnews.com.",
        hi: "किसी भी GDPR अधिकार का उपयोग करने के लिए privacy@euroconnectnews.com पर ईमेल करें।",
      },
    ],
  },
};

export const SITE_PAGE_SLUGS = Object.keys(SITE_PAGES);
