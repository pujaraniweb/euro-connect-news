import { NextResponse } from "next/server";
import { headers } from "next/headers";

// TEMPORARY diagnostic: shows which geolocation-related headers actually reach
// the origin (to debug country detection). Does NOT expose full IPs.
export async function GET() {
  const h = await headers();
  const mask = (v: string | null) =>
    v ? v.replace(/\d+\.\d+\.\d+\.\d+/g, (ip) => ip.split(".").slice(0, 2).join(".") + ".x.x") : null;

  return NextResponse.json({
    "cf-ipcountry": h.get("cf-ipcountry"),
    "x-vercel-ip-country": h.get("x-vercel-ip-country"),
    "x-geo-country": h.get("x-geo-country"),
    "x-country-code": h.get("x-country-code"),
    "cf-connecting-ip-present": !!h.get("cf-connecting-ip"),
    "cf-connecting-ip-masked": mask(h.get("cf-connecting-ip")),
    "cf-ray": h.get("cf-ray"),
    server: h.get("host"),
    allHeaderNames: [...h.keys()].sort(),
  });
}
