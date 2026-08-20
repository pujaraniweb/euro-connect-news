"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

/** Goes to the previous page; falls back to the homepage if there's no history. */
export function BackButton() {
  const router = useRouter();
  const t = useTranslations("common");
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      className="inline-flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-accent"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t("back")}
    </button>
  );
}
