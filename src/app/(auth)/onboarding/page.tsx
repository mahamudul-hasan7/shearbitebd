import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PlatformTour } from "@/components/auth/platform-tour";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Platform Overview & Onboarding | ShareBite BD",
  description: "Learn how ShareBite BD connects safe surplus food with nearby communities in Bangladesh.",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl rounded-2xl sm:rounded-3xl border border-line bg-surface/90 p-6 shadow-xl backdrop-blur-md sm:p-10 lg:p-12">
        {/* Top Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <BrandLogo href={ROUTES.home} />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
              Dhaka Metro Food Network
            </span>
            <LanguageSwitch />
            <Link
              href={ROUTES.auth.login}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 sm:text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Desktop Platform Tour */}
        <PlatformTour />
      </div>
    </main>
  );
}
