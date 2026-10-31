import { Hanken_Grotesk, Martian_Mono } from "next/font/google";
import "@/styles/globals.css";

// One technical voice for the world: widths from normal (text) to expanded (headlines).
const mono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-mono", display: "swap" });
// A clean grotesk for the warm compass section.
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "RayMindset — Welcome to Ray's Mind",
    template: "%s — RayMindset",
  },
  description:
    "Explore the ideas, ventures, travels, writing, and experiences of Rayansh Singh.",
  // Keep every environment out of search indexes until a production launch is approved.
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#05080c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
