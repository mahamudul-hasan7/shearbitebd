"use client";

import { ArrowRight, BarChart3, Check, Clock3, PackagePlus, ScanLine, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    eyebrow: "Post surplus food",
    title: "Rescue food, reach people",
    description: "Connect verified donors, NGOs, and volunteers before safe pickup deadlines expire.",
    icon: PackagePlus,
    points: [
      [Clock3, "Live Rescue Clock"],
      [UsersRound, "Verified coordination"],
      [Check, "Clear status updates"],
    ],
  },
  {
    eyebrow: "Smart coordination",
    title: "Match urgency with real need",
    description: "Rule-based recommendations consider distance, quantity, capacity, dietary needs, and time remaining.",
    icon: Search,
    points: [
      [Search, "Nearby discovery"],
      [Clock3, "Urgency priority"],
      [ScanLine, "QR handover"],
    ],
  },
  {
    eyebrow: "Measure the outcome",
    title: "Track every rescue and its impact",
    description: "Follow pickup, delivery, distribution, and the measurable contribution of every completed rescue.",
    icon: BarChart3,
    points: [
      [BarChart3, "Impact dashboard"],
      [ScanLine, "Verified delivery"],
      [UsersRound, "Beneficiaries served"],
    ],
  },
] as const;

export function OnboardingCarousel() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const HeroIcon = slide.icon;
  const last = index === slides.length - 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[3rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-accent-50 p-8 shadow-card">
        <div className="absolute -left-16 -top-16 size-44 rounded-full bg-brand-200/70 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 size-44 rounded-full bg-accent-100 blur-2xl" />
        <div className="relative flex h-full flex-col items-center justify-center text-center">
          <span className="grid size-32 place-items-center rounded-[2.5rem] bg-brand-600 text-white shadow-float">
            <HeroIcon className="size-16" />
          </span>
          <div className="mt-8 flex items-center gap-2">
            {slide.points.map(([Icon, label]) => (
              <span key={label} className="grid size-12 place-items-center rounded-2xl border border-line bg-white text-brand-700 shadow-sm" title={label}>
                <Icon className="size-6" />
              </span>
            ))}
          </div>
          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent-600">{slide.eyebrow}</p>
          <Link href="/role-selection" className="text-sm font-bold text-brand-700 hover:text-brand-800">Skip</Link>
        </div>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-brand-900 sm:text-5xl">{slide.title}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-600 sm:text-lg">{slide.description}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {slide.points.map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
              <span className="text-sm font-bold text-ink-700">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {last ? (
            <Link href="/role-selection" className="flex-1 sm:flex-none">
              <Button size="lg" fullWidth rightIcon={<ArrowRight className="size-5" />}>Get started</Button>
            </Link>
          ) : (
            <Button size="lg" rightIcon={<ArrowRight className="size-5" />} onClick={() => setIndex((value) => value + 1)}>
              Continue
            </Button>
          )}
          {index > 0 && (
            <Button size="lg" variant="ghost" onClick={() => setIndex((value) => value - 1)}>
              Back
            </Button>
          )}
        </div>

        <div className="mt-8 flex gap-2" aria-label="Onboarding pages">
          {slides.map((item, slideIndex) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={cn("h-2 rounded-full transition-all", slideIndex === index ? "w-10 bg-accent-500" : "w-2 bg-brand-200")}
              aria-label={`Show onboarding page ${slideIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
