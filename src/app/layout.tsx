import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1a1a18",
};

export const metadata: Metadata = {
  title: "Reroll Gaming | Marrero, LA",
  description: "Trading card games, organized play, and community. Marrero's only dedicated game store.",
  openGraph: {
    title: "Reroll Gaming",
    description: "Cards, community, and competitive play. Marrero, Louisiana.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
