"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Trash2 } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Politics",
  "Business",
  "Visa",
  "Culture",
  "Sports",
  "Technology",
  "Health",
];

const KEY = "ecn:preferences";

type Prefs = { language: "EN" | "HI"; topics: string[] };

const DEFAULTS: Prefs = { language: "EN", topics: ["Business", "Visa"] };

export function PreferencesClient() {
  const tp = useTranslations("preferences");
  const ttopic = useTranslations("preferences.topicNames");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  function switchLanguage(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  function toggleTopic(t: string) {
    setPrefs((p) => ({
      ...p,
      topics: p.topics.includes(t)
        ? p.topics.filter((x) => x !== t)
        : [...p.topics, t],
    }));
    setSaved(false);
  }

  function save() {
    // Mock: persist locally. In production also sync to Supabase profile.
    localStorage.setItem(KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function clearCache() {
    localStorage.removeItem("ecn:bookmarks");
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        {tp("title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{tp("subtitle")}</p>

      {/* Language */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
          {tp("language")}
        </h2>
        <div className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLanguage(l)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                locale === l
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {l === "en" ? "English" : "हिन्दी"}
            </button>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
          {tp("topics")}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((topic) => {
            const on = prefs.topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  on
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface text-foreground/80 hover:border-accent/50"
                )}
              >
                {ttopic(topic)}
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded-full border transition-colors",
                    on
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border"
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={save}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          {saved && <Check className="h-4 w-4" />}
          {saved ? tp("saved") : tp("save")}
        </button>
        <button
          type="button"
          onClick={clearCache}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-5 text-sm font-semibold text-muted-foreground transition-colors hover:border-down hover:text-down"
        >
          <Trash2 className="h-4 w-4" />
          {cleared ? tp("cacheCleared") : tp("clearCache")}
        </button>
      </div>
    </div>
  );
}
