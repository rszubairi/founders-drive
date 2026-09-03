import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { SiteNav, SiteFooter } from "@/components/site";

const display = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});
const serif = Newsreader({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Founders Drive — Roast My Startup",
  description:
    "The Malaysian startup ecosystem. Four startups pitch every month, then take ten minutes of honest challenge — with follow-through.",
  icons: { icon: "/assets/logo.png", apple: "/assets/logo.png" },
  openGraph: {
    title: "Founders Drive — Roast My Startup",
    description:
      "The Malaysian startup ecosystem. Four startups pitch every month, then take ten minutes of honest challenge — with follow-through.",
    images: ["/assets/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable} antialiased`}
        style={
          {
            // wire next/font CSS variables into the design tokens
            "--font-display": "var(--font-instrument), Georgia, serif",
            "--font-sans": "var(--font-plex-sans), system-ui, sans-serif",
            "--font-mono": "var(--font-plex-mono), ui-monospace, monospace",
            "--font-serif": "var(--font-newsreader), Georgia, serif",
          } as React.CSSProperties
        }
      >
        <ConvexClientProvider>
          <SiteNav />
          <main>{children}</main>
          <SiteFooter />
        </ConvexClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
