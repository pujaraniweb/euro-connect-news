import type { Metadata } from "next";
import { PreferencesClient } from "@/components/preferences-client";

export const metadata: Metadata = {
  title: "My Preferences",
  description: "Personalise your Euro Connect News feed.",
};

export default function PreferencesPage() {
  return <PreferencesClient />;
}
