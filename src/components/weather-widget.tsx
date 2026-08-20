"use client";

import { useEffect, useState } from "react";

// Fallback shown if the user denies location or it's unavailable (real weather,
// not a hard-coded temperature). Keeps the widget working without breaking.
const FALLBACK = { name: "Frankfurt", lat: 50.11, lon: 8.68 };

/** Current temperature in °C for a coordinate (Open-Meteo, no API key). */
async function fetchTempC(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m&temperature_unit=celsius`
    );
    if (!res.ok) return null;
    const j = await res.json();
    const t = j?.current?.temperature_2m;
    return typeof t === "number" ? t : null;
  } catch {
    return null;
  }
}

/** City name for a coordinate (BigDataCloud reverse geocoding, no API key). */
async function fetchCity(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}` +
        `&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const j = await res.json();
    return j.city || j.locality || j.principalSubdivision || null;
  } catch {
    return null;
  }
}

export function WeatherWidget() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    let alive = true;

    // The widget lives in the desktop-only utility bar; don't prompt for location
    // on mobile where it isn't visible (keeps the existing mobile design intact).
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    // Coordinates are used ONLY to fetch the city + weather below. They are never
    // stored (no localStorage), never sent to our server, never logged.
    const show = async (lat: number, lon: number, knownName?: string) => {
      const [temp, city] = await Promise.all([
        fetchTempC(lat, lon),
        knownName ? Promise.resolve(knownName) : fetchCity(lat, lon),
      ]);
      if (!alive) return;
      const name = city || knownName || "";
      setLabel(temp != null ? `${name} ${Math.round(temp)}°C` : name);
    };

    const useFallback = () => show(FALLBACK.lat, FALLBACK.lon, FALLBACK.name);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => show(pos.coords.latitude, pos.coords.longitude), // allowed → detected
        () => useFallback(), // denied / error → fallback
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    } else {
      useFallback();
    }

    return () => {
      alive = false;
    };
  }, []);

  // Same markup/classes as the previous static widget — design unchanged.
  return (
    <span
      suppressHydrationWarning
      className="flex items-center gap-1.5 font-medium text-india"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-india" />
      {label || "…"}
    </span>
  );
}
