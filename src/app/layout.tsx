import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MockAuthProvider } from "@/features/auth/mock-auth";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { RealNotificationToast } from "@/components/layout/real-notification-toast";
import { ActionSuccessModal } from "@/components/ui/action-success-modal";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShareBite BD — স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক",
    template: "%s | ShareBite BD",
  },
  description: "Smart surplus food rescue and redistribution platform for Bangladesh.",
  applicationName: "ShareBite BD",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ShareBite BD",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#02271d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="bn">
      <head>
        <link rel="preload" href="/fonts/hind-siliguri-ijwTs5juQtsyLLR5jN4cxBEoTI7ax9k0.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/outfit-QGYvz_MVcBeNP4NJtEtq.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <MockAuthProvider>
          <LanguageProvider>
            {children}
            <RealNotificationToast />
            <ActionSuccessModal />
          </LanguageProvider>
        </MockAuthProvider>
      </body>
    </html>
  );
}
