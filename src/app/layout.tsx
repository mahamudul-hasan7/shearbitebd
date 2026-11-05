import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MockAuthProvider } from "@/features/auth/mock-auth";
import { LanguageProvider } from "@/lib/i18n/language-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShareBite BD — স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক",
    template: "%s | ShareBite BD",
  },
  description: "Smart surplus food rescue and redistribution platform for Bangladesh.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#02271d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <MockAuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </MockAuthProvider>
      </body>
    </html>
  );
}
