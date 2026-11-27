"use client";

import { useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Play,
  ShieldCheck,
  Sparkles,
  Bike,
} from "lucide-react";
import {
  HeroSloganLine,
  HeroStoryControls,
  HeroStoryMedia,
  useHeroStory,
} from "@/components/home/hero-story";
import { HeroVideoModal } from "@/components/home/hero-video-modal";
import {
  ConfirmedIcon,
  FoodBoxIcon,
  LiveIcon,
  LiveIconGroup,
  OrganizationIcon,
  RouteCompassIcon,
} from "@/components/motion/live-icon";
import homeSloganStyles from "@/components/home/home-slogan.module.css";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HERO_HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified Handover",
    subtitle: "OTP & QR confirmation",
  },
  {
    icon: Bike,
    title: "Fast Dispatch",
    subtitle: "Nearby rider matching",
  },
  {
    icon: Clock,
    title: "Real-Time",
    subtitle: "Live delivery tracking",
  },
] as const;

const WORKFLOW_DOCK_STEPS = [
  {
    number: "01",
    icon: FoodBoxIcon,
    title: "Post Food",
    description: "Share quantity & pickup time",
  },
  {
    number: "02",
    icon: OrganizationIcon,
    title: "NGO Claims",
    description: "Verified charity reserves it",
  },
  {
    number: "03",
    icon: RouteCompassIcon,
    title: "Rider Pickup",
    description: "QR code confirms collection",
  },
  {
    number: "04",
    icon: ConfirmedIcon,
    title: "Safe Delivery",
    description: "Live impact & record updated",
  },
] as const;

export function DesktopHero({
  isLoggedIn,
  dashboardHref,
}: {
  language?: "bn" | "en";
  isLoggedIn: boolean;
  dashboardHref: string;
}) {
  const tx = useUiText();
  const { stepSlide } = useHeroStory();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (typeof endX === "number") {
      const delta = endX - touchStartX.current;
      if (Math.abs(delta) > 45) stepSlide(delta < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="hero"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex flex-col justify-between overflow-hidden border-b border-emerald-100/80 bg-[#f1faf6] pt-10 pb-6 sm:pt-12 sm:pb-8 lg:min-h-[calc(100dvh-72px)] lg:pt-14 lg:pb-9"
    >
      {/* Bespoke Clear Right-Aligned Food Rescue Photography + Subtle Left Safety Blend */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <HeroStoryMedia imageClassName="object-cover object-right" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #f2faf6 0%, #f2faf6f5 38%, rgba(242, 250, 246, 0.72) 48%, rgba(242, 250, 246, 0.08) 58%, transparent 66%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              "linear-gradient(180deg, rgba(242,250,246,0) 0%, rgba(242,250,246,0.92) 82%, #f1faf6 100%)",
          }}
        />
      </div>

      {/* Main Hero Container (Fills Viewport Gracefully) */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 sm:px-6 lg:px-8">
        <div className="grid flex-1 items-center gap-8 py-2 lg:grid-cols-12 lg:gap-4 lg:py-4">
          {/* Left Typography Column */}
          <div className="max-w-[780px] lg:col-span-8">
            {/* Mint Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/95 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.22)] backdrop-blur-sm">
              <Sparkles className="size-3.5 text-emerald-600" aria-hidden="true" />
              <span>{tx("Smart Food Rescue Network · Bangladesh")}</span>
            </div>

            {/* Clean Single-Line Top Headline + Typing Animated Emerald Highlight Line */}
            <h1 className={cn(homeSloganStyles.slogan, "mt-5")}>
              <span className="lg:whitespace-nowrap">
                {tx("Share Extra Food, Stop Waste.")}
              </span>
              <HeroSloganLine className="bg-gradient-to-r from-[#047857] via-[#059669] to-[#0d9488] bg-clip-text text-transparent">
                {tx("Nourish Every Community")}
              </HeroSloganLine>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-[54ch] text-[15px] leading-[1.75] text-slate-600 sm:text-base">
              {tx(
                "Post surplus meals from your home, restaurant, or event. ShareBite BD connects verified NGOs and volunteer riders to deliver safe food on time.",
              )}
            </p>

            {/* Primary & Secondary Pill CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href={isLoggedIn ? dashboardHref : ROUTES.auth.roleSelection}
                className="group inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[#065f46] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_-8px_rgba(6,95,70,0.52)] transition-all hover:-translate-y-0.5 hover:bg-[#047857] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
              >
                <span>
                  {isLoggedIn ? tx("Continue to dashboard") : tx("Share Extra Food")}
                </span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                data-testid="open-hero-video"
                className="inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 px-5 py-3 text-sm font-semibold text-[#022c22] shadow-[0_8px_22px_-12px_rgba(2,44,34,0.2)] backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                </span>
                <span>{tx("See How It Works")}</span>
              </button>
            </div>

            {/* 3 Minimal Icon Highlights */}
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
              {HERO_HIGHLIGHTS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-emerald-200/80 bg-emerald-50/90 text-emerald-700 shadow-2xs">
                    <Icon className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold leading-tight text-[#022c22]">
                      {tx(title)}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] leading-snug text-slate-500">
                      {tx(subtitle)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Open Photography Zone + Slide Controls */}
          <div className="flex items-end justify-end lg:col-span-4 lg:self-end lg:pb-2">
            <HeroStoryControls className="shadow-md" />
          </div>
        </div>

        {/* Bottom White Frosted Floating 4-Step Dock */}
        <div className="relative z-20 mt-8 rounded-[22px] border border-white/95 bg-white/95 p-5 shadow-[0_22px_55px_-16px_rgba(2,44,34,0.14)] backdrop-blur-md sm:mt-10 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
            <div className="shrink-0 lg:w-52 lg:border-r lg:border-emerald-100 lg:pr-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                {tx("How it works?")}
              </p>
              <h2 className="mt-1 font-heading text-lg font-extrabold leading-snug text-[#022c22]">
                {tx("From one post to a safe meal")}
              </h2>
            </div>

            <LiveIconGroup className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2">
              {WORKFLOW_DOCK_STEPS.map((step, index) => (
                <div
                  key={step.number}
                  className="group relative flex items-center gap-3 rounded-2xl px-1.5 py-1.5 transition-colors hover:bg-emerald-50/60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-700 transition-transform group-hover:scale-105">
                    <LiveIcon
                      icon={step.icon}
                      motion="ambient"
                      className="size-[19px]"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10.5px] font-bold tracking-wide text-emerald-700/80">
                      {step.number}
                    </span>
                    <h3 className="text-[13.5px] font-bold leading-snug text-[#022c22]">
                      {tx(step.title)}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] leading-[1.4] text-slate-500">
                      {tx(step.description)}
                    </p>
                  </div>
                  {index < WORKFLOW_DOCK_STEPS.length - 1 && (
                    <ChevronRight
                      className="hidden size-3.5 shrink-0 text-slate-300 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </LiveIconGroup>
          </div>
        </div>
      </div>

      <HeroVideoModal open={isVideoOpen} onClose={() => setIsVideoOpen(false)} stepsHref="#how-it-works" />
    </section>
  );
}
