import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";

export const metadata: Metadata = {
  title: "VyapaarSathi - Government Action Tracker",
  description: "Track government notices for MSMEs and CAs to prevent missing compliance deadlines.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
