import { UiText } from "@/lib/i18n/ui-text-node";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PlatformTour } from "@/components/auth/platform-tour";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Platform Overview & Onboarding",
  description: "Learn how ShareBite BD connects safe surplus food with nearby communities in Bangladesh.",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(640px_380px_at_10%_8%,rgba(16,185,129,0.18),transparent_68%),radial-gradient(580px_380px_at_90%_12%,rgba(56,189,248,0.16),transparent_68%),#eef6f3] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="liquid-glass-card mx-auto max-w-7xl rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12">
        {/* Top Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <BrandLogo href={ROUTES.home} />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
              <UiText source={"Dhaka Metro Food Network"} /></span>
            <LanguageSwitch />
            <Link
              href={ROUTES.auth.login}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 sm:text-sm"
            >
              <UiText source={"Sign In"} /></Link>
          </div>
        </div>

        {/* Desktop Platform Tour */}
        <PlatformTour />
      </div>
    </main>
  );
}
