"use client";

import { useState } from "react";
import { Check, Loader2, Mail, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export function SubscribeButton({ full = false }: { full?: boolean }) {
  const t = useTranslations("subscribe");
  const th = useTranslations("header");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    // Mock API — replace with POST /api/news/subscribe
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  }

  function close() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={th("subscribe")}
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-accent text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90",
          // Header (compact): mail icon on mobile, full text label from sm up —
          // keeps Subscribe clearly visible without crowding the logo on phones.
          full ? "h-10 w-full px-3.5 text-sm" : "w-8 px-0 sm:w-auto sm:px-3.5"
        )}
      >
        {full ? (
          th("subscribe")
        ) : (
          <>
            <Mail className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">{th("subscribe")}</span>
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-serif text-lg font-bold leading-tight">
                    {t("title")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("subtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-up/15 text-up">
                  <Check className="h-6 w-6" />
                </span>
                <p className="font-medium">{t("successTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("successSub")}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder={t("emailPlaceholder")}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent",
                    status === "error" ? "border-down" : "border-border"
                  )}
                />
                {status === "error" && (
                  <p className="text-xs text-down">{t("invalidEmail")}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {status === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("cta")}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  {t("noSpam")}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
