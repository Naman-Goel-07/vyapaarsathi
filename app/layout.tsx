import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";

const noto = Noto_Sans({ subsets: ["latin"], display: "swap", variable: "--font-owner" });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], display: "swap", variable: "--font-owner-hi" });

export const metadata: Metadata = {
  title: "VyapaarSathi: tax notice help for shopkeepers",
  description: "Take a photo of a government notice, understand it in your language, and let your CA handle the reply.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${noto.variable} ${devanagari.variable}`}>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
