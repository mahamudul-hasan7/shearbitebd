"use client";

import { ArrowRight, HeartHandshake, Leaf, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((value) => (value >= 100 ? 100 : value + 2));
    }, 45);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdf8] px-5 py-8 sm:px-8">
      <div className="absolute -left-28 top-20 size-80 rounded-full bg-brand-100/80 blur-3xl" />
      <div className="absolute -right-28 bottom-20 size-80 rounded-full bg-accent-100/80 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(165deg,transparent_35%,rgba(226,241,229,0.75)_35%,rgba(226,241,229,0.75)_55%,rgba(255,237,204,0.75)_55%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center text-center">
        <div className="absolute right-0 top-0">
          <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-sm font-black text-brand-700 shadow-sm backdrop-blur hover:bg-white">
            Skip <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[4rem] bg-brand-400/20 blur-3xl" />
          <div className="relative grid size-40 place-items-center rounded-[3.5rem] bg-brand-600 text-white shadow-float sm:size-48">
            <HeartHandshake className="size-20 sm:size-24" />
            <span className="absolute -right-4 -top-4 grid size-14 place-items-center rounded-full bg-accent-500 text-white ring-8 ring-[#fffdf8]"><Leaf className="size-7" /></span>
          </div>
        </div>

        <div className="mt-10 scale-125 sm:scale-150"><BrandLogo href="/onboarding" /></div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-muted-600 sm:text-base">Smart Surplus Food Rescue Platform</p>
        <h1 className="mt-8 max-w-3xl text-3xl font-black leading-tight text-brand-900 sm:text-5xl">অতিরিক্ত খাবার নষ্ট না করে, সঠিক সময়ে সঠিক মানুষের কাছে পৌঁছে দেওয়া</h1>

        <div className="mt-10 flex items-center gap-3 rounded-3xl border border-brand-100 bg-white/80 px-5 py-4 shadow-card backdrop-blur">
          <PackageOpen className="size-8 text-accent-500" />
          <div className="text-left">
            <p className="font-black text-brand-800">Rescue Food · Respect Time · Measure Impact</p>
            <p className="mt-1 text-sm text-muted-600">UIU Campus pilot experience</p>
          </div>
        </div>

        <div className="mt-10 w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <span className="size-2 rounded-full bg-brand-200" />
            <span className="size-2 rounded-full bg-accent-500" />
            <span className="size-2 rounded-full bg-brand-200" />
          </div>
        </div>

        <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 font-black text-brand-700 hover:text-brand-800">
          Continue <ArrowRight className="size-5" />
        </Link>
      </div>
    </main>
  );
}
