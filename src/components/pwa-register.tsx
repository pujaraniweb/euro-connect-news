"use client";

import { useEffect, useState } from "react";
import { Bell, WifiOff, X } from "lucide-react";
import { useTranslations } from "next-intl";

const SESSION_KEY = "ecn:sessions";
const SESSION_FLAG = "ecn:session-counted";
const PUSH_DECIDED = "ecn:push-decided";
const SESSIONS_BEFORE_PROMPT = 3;

export function PwaRegister() {
  const t = useTranslations("pwa");
  const [offline, setOffline] = useState(false);
  const [showPush, setShowPush] = useState(false);

  useEffect(() => {
    // 1. Register the service worker (production only — avoids dev HMR clashes).
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort */
      });
    }

    // 2. Online / offline banner.
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    // 3. Count sessions once per browser session, prompt for push after N.
    let sessions = 0;
    try {
      if (!sessionStorage.getItem(SESSION_FLAG)) {
        sessions = Number(localStorage.getItem(SESSION_KEY) ?? "0") + 1;
        localStorage.setItem(SESSION_KEY, String(sessions));
        sessionStorage.setItem(SESSION_FLAG, "1");
      } else {
        sessions = Number(localStorage.getItem(SESSION_KEY) ?? "0");
      }
    } catch {
      /* storage may be unavailable */
    }

    const decided =
      typeof localStorage !== "undefined" &&
      localStorage.getItem(PUSH_DECIDED) === "1";
    const supported =
      typeof window !== "undefined" && "Notification" in window;

    if (
      supported &&
      !decided &&
      Notification.permission === "default" &&
      sessions >= SESSIONS_BEFORE_PROMPT
    ) {
      const t = setTimeout(() => setShowPush(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("online", update);
        window.removeEventListener("offline", update);
      };
    }

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  function dismissPush() {
    try {
      localStorage.setItem(PUSH_DECIDED, "1");
    } catch {
      /* ignore */
    }
    setShowPush(false);
  }

  async function enablePush() {
    try {
      if ("Notification" in window) await Notification.requestPermission();
    } catch {
      /* ignore */
    }
    dismissPush();
  }

  return (
    <>
      {offline && (
        <div className="fixed inset-x-0 bottom-16 z-[60] mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm shadow-lg lg:bottom-4">
          <WifiOff className="h-4 w-4 text-accent" />
          {t("offlineBanner")}
        </div>
      )}

      {showPush && (
        <div className="fixed inset-x-4 bottom-20 z-[70] mx-auto max-w-sm rounded-xl border border-border bg-surface p-4 shadow-2xl lg:inset-x-auto lg:right-6 lg:bottom-6">
          <button
            type="button"
            onClick={dismissPush}
            aria-label="Dismiss"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold leading-tight">
                {t("pushTitle")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("pushSub")}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={enablePush}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              {t("enable")}
            </button>
            <button
              type="button"
              onClick={dismissPush}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("notNow")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
