"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** Formats a Date as e.g. "Tue, 18 Aug 2026 09:54 AM" (optionally with seconds). */
function formatNow(d: Date, withSeconds: boolean): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const year = d.getFullYear();
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const time = withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  return `${weekday}, ${day} ${month} ${year} ${time} ${ampm}`;
}

export function LiveClock({
  withSeconds = false,
  showIcon = true,
  className,
}: {
  withSeconds?: boolean;
  showIcon?: boolean;
  className?: string;
}) {
  // Empty until mounted so server/client markup matches (no hydration mismatch).
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () => setNow(formatNow(new Date(), withSeconds));
    tick();
    const id = setInterval(tick, 1000); // update every second
    return () => clearInterval(id);
  }, [withSeconds]);

  return (
    <span
      suppressHydrationWarning
      className={
        className ??
        "flex shrink-0 items-center gap-1.5 border-l border-border pl-3 text-xs tabular text-muted-foreground"
      }
    >
      {showIcon && <Clock className="h-3.5 w-3.5" />}
      <span className={withSeconds ? "min-w-[12rem]" : "min-w-[10.5rem]"}>{now}</span>
    </span>
  );
}
