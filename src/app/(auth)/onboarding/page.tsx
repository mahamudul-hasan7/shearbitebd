import { BrandLogo } from "@/components/brand/brand-logo";
import { OnboardingCarousel } from "@/components/auth/onboarding-carousel";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Get Started", description: "Learn how ShareBite BD connects safe surplus food with nearby communities." };

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-7 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-7xl rounded-panel border border-white/80 bg-white/90 p-5 shadow-dialog backdrop-blur sm:p-8 lg:p-12">
        <div className="mb-10 flex items-center justify-between gap-4">
          <BrandLogo href={ROUTES.auth.splash} />
          <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-700">Rescue Food · Measure Impact</span>
        </div>
        <OnboardingCarousel />
      </div>
    </main>
  );
}
