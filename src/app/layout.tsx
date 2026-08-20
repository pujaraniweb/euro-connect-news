import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { detectRegion } from "@/lib/region";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/bottom-nav";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Euro Connect News — India & Europe Daily",
    template: "%s · Euro Connect News",
  },
  description:
    "Timely, balanced coverage bridging India and Europe: trade, diaspora, visas, markets, politics and culture.",
  metadataBase: new URL("https://www.euroconnectnews.com"),
  openGraph: {
    title: "Euro Connect News — India & Europe Daily",
    description:
      "Focused, high-signal journalism on the India–Europe intersection.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "Euro Connect",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const region = await detectRegion();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Header region={region} />
            <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 sm:px-6 lg:pb-12">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <PwaRegister />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
