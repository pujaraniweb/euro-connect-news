import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Euro Connect News for India–Europe stories.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-10 text-muted-foreground">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
