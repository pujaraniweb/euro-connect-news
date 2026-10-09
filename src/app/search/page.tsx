import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";
import { getSearchCorpus } from "@/lib/archive";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Euro Connect News for India–Europe stories.",
};

export default async function SearchPage() {
  // Built on the server and handed down. SearchClient used to build this itself
  // at module scope, which compiled the entire archive into the client bundle.
  const corpus = await getSearchCorpus();
  return (
    <Suspense fallback={<div className="py-10 text-muted-foreground">Loading…</div>}>
      <SearchClient corpus={corpus} />
    </Suspense>
  );
}
