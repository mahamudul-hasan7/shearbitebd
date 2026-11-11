import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

interface AuthShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  artworkVariant?: "community" | "security" | "impact";
  backHref?: string;
  className?: string;
  contentClassName?: string;
}

export function AuthShell({
  children,
  title = "একটি ক্লিকে খাবার পৌঁছাক অভাবী মানুষের পাতে।",
  description = "ক্যাফেটেরিয়া ও রেস্তোরাঁর তাজা অতিরিক্ত খাবার বিদ্যানন্দ ও মাস্তুল ফাউন্ডেশনের মতো নিবন্ধিত দাতব্য প্রতিষ্ঠানে পৌঁছে দেওয়ার নিরাপদ প্ল্যাটফর্ম।",
  eyebrow,
  backHref = ROUTES.home,
  className,
  contentClassName,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-100/70 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
      <div
        className={cn(
          "w-full max-w-[1400px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 grid min-h-0 lg:min-h-[760px] lg:grid-cols-[minmax(380px,0.85fr)_minmax(600px,1.35fr)]",
          className,
        )}
      >
        {/* Left Branding Panel with Dhaka Cityscape Image */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-[#03271d] to-[#011812] p-10 text-white lg:flex lg:flex-col xl:p-14">
          {/* Authentic Dhaka Cityscape Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/dhaka-cityscape-auth.jpg"
              alt="Dhaka Skyline Hatirjheel at Dusk"
              fill
              className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021f17] via-[#02241b]/85 to-[#01150f]/90" />
            <div className="absolute inset-0 dark-surface-grid opacity-35" />
          </div>

          <div className="relative z-10">
            <BrandLogo href={ROUTES.home} inverse />

            {eyebrow && (
              <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/60 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md font-heading">
                <Sparkles className="size-3 text-amber-400 animate-icon-breathe" />
                {eyebrow}
              </div>
            )}

            <h1 className={cn("text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl font-heading", eyebrow ? "mt-5" : "mt-10")}>
              {title}
            </h1>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-emerald-100/80 font-normal xl:text-base max-w-md">
              {description}
            </p>

            {/* Key Value Bullets with Authentic Dhaka Context */}
            <div className="mt-7 space-y-3.5 text-xs text-emerald-200/90 font-medium">
              <div className="flex items-center gap-3">
                <div className="grid size-6 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <span>UIU, BRACU ও শীর্ষ ক্যাটারার্স থেকে তাজা অতিরিক্ত খাবার সংগ্রহ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-6 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <span>বিদ্যানন্দ ও মাস্তুল ফাউন্ডেশনের সাথে কিউআর ভেরিফাইড ওটিপি হ্যান্ডওভার</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-6 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <span>ঢাকা মেট্রো লাইভ জিপিএস রুট ও বিএফএসএ হাইজিন কমপ্লায়েন্ট পরিবহন</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust & Impact Cards */}
          <div className="relative z-10 mt-auto pt-8">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["⚡ ১৫ মিনিট", "জরুরি ঢাকা অ্যালার্ট"],
                ["🛡️ ১০০% ভেরিফাইড", "নিবন্ধিত এনজিও নেটওয়ার্ক"],
                ["🍱 ৪,৮২০+ মিল", "আজকের উদ্ধারকৃত খাবার"],
              ].map(([label, helper]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-emerald-700/30 bg-emerald-950/60 p-3.5 backdrop-blur-md shadow-sm"
                >
                  <p className="text-xs font-black text-white font-heading">{label}</p>
                  <p className="mt-0.5 text-[10px] text-emerald-300/70 font-medium">{helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between text-[11px] text-emerald-300/60 font-mono">
              <span>CIVIC FOOD TECH INITIATIVE</span>
              <span>DHAKA · CHATTOGRAM · SYLHET</span>
            </div>
          </div>
        </aside>

        {/* Right Form Section */}
        <section className="relative flex min-h-full flex-col bg-white">
          {/* Top Bar for Desktop */}
          <div className="hidden lg:flex items-center justify-between border-b border-slate-100 px-8 py-4">
            <Link
              href={backHref}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors font-heading cursor-pointer"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>হোম পেজে ফিরে যান</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-600/15 shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600 animate-icon-breathe" />
                নিরাপদ সিভিক পোর্টাল
              </span>
            </div>
          </div>

          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden">
            <BrandLogo href={ROUTES.home} />
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/15">
              ShareBite BD
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-10 xl:p-12">
            <div className={cn("w-full max-w-lg", contentClassName)}>{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
