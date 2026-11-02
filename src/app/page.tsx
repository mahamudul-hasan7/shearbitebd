import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users2,
  Utensils,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "ShareBite BD — Smart Surplus Food Rescue Platform",
  description:
    "Connecting cafeterias, restaurants, and event hosts with verified NGOs to rescue surplus food and feed communities across Bangladesh.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink-900 selection:bg-brand-100 selection:text-brand-900 antialiased">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-semibold text-muted-600 hover:text-ink-900 transition-colors">
              How it works
            </a>
            <a href="#impact" className="text-sm font-semibold text-muted-600 hover:text-ink-900 transition-colors">
              Our Impact
            </a>
            <a href="#community" className="text-sm font-semibold text-muted-600 hover:text-ink-900 transition-colors">
              Community
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.auth.login}
              className="rounded-xl px-4 py-2 text-sm font-bold text-ink-900 hover:bg-slate-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href={ROUTES.auth.roleSelection}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-xs shadow-brand-700/20 hover:from-brand-700 hover:to-brand-800 transition-all active:scale-95"
            >
              Get Started <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 shadow-2xs backdrop-blur-xs">
                <Sparkles className="size-3.5 text-amber-500" />
                Smart Surplus Food Rescue · Bangladesh
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                Rescue surplus food.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">
                  Feed communities.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
                ShareBite BD bridges cafeterias, restaurants, and catered events with verified local charities. 
                Turn edible surplus food into fresh, dignified meals with real-time tracking and verified handover.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  href={ROUTES.auth.roleSelection}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 text-sm sm:text-base font-bold text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-800 transition-all active:scale-95"
                >
                  Join the Network <ArrowRight className="size-4.5" />
                </Link>
                <Link
                  href={ROUTES.auth.login}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm sm:text-base font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Demo Log In
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4.5 text-emerald-600" />
                  <span>100% Verified NGOs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4.5 text-emerald-600" />
                  <span>Time-Critical Rescue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 text-emerald-600" />
                  <span>Food Safety Standards</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-float">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Surplus Alert</span>
                  </div>
                  <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-black text-accent-600">
                    Urgent Pickup
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-canvas p-4 border border-line/60">
                    <p className="text-xs font-semibold text-muted-400">DONOR LOCATION</p>
                    <p className="mt-0.5 text-sm font-bold text-ink-900 flex items-center gap-1.5">
                      <MapPin className="size-4 text-brand-600 shrink-0" />
                      UIU Cafeteria, Madani Avenue, Dhaka
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-brand-50/60 p-3.5 border border-brand-100">
                      <p className="text-xs font-semibold text-brand-800">Available Meals</p>
                      <p className="mt-1 text-2xl font-black text-brand-900">120 Meals</p>
                      <p className="text-[11px] text-brand-700 font-medium">Warm rice, curry & dal</p>
                    </div>
                    <div className="rounded-2xl bg-accent-50/60 p-3.5 border border-accent-100">
                      <p className="text-xs font-semibold text-accent-700">Time Window</p>
                      <p className="mt-1 text-2xl font-black text-accent-900">45 Mins</p>
                      <p className="text-[11px] text-accent-700 font-medium">Safe pickup deadline</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line p-3.5 flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-brand-100 text-brand-800 grid place-items-center font-black text-xs">
                        HF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink-900">Hope Foundation BD</p>
                        <p className="text-[11px] text-muted-400">Assigned Rescue Volunteer</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                      En Route
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <p className="text-xs text-muted-400">
                    Empowering zero food waste across Dhaka City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Metrics / Stats */}
      <section id="impact" className="border-y border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 text-center">
            <div className="border-r border-slate-200/80 last:border-none px-2">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-emerald-600">5,840+</p>
              <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Meals Rescued</p>
            </div>
            <div className="border-r border-slate-200/80 last:border-none px-2">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">32+</p>
              <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Verified NGOs</p>
            </div>
            <div className="border-r border-slate-200/80 last:border-none px-2">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-amber-600">&lt; 35m</p>
              <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Avg. Rescue Time</p>
            </div>
            <div className="px-2">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-teal-700">99.4%</p>
              <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500">Safe Handover Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How it works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 ring-1 ring-emerald-600/15">
              Simple & Rapid Workflow
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How ShareBite BD Works
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed font-normal">
              From fresh prepared meal surplus to community plates in three structured, safe steps.
            </p>
          </div>

          <div className="mt-14 sm:mt-18 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                <Utensils className="size-6" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-700">Step 01</p>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Post Surplus in Minutes</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 font-normal">
                Donors specify food type, quantity, safe storage conditions, and pickup time window directly from their mobile or desktop dashboard.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-600/15">
                <Building2 className="size-6" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-amber-700">Step 02</p>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">NGO Matches & Claims</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 font-normal">
                Nearby verified NGOs receive smart alerts. They claim donations matching their beneficiary capacity and dispatch verified rescue volunteers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-600/15">
                <PackageCheck className="size-6" />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-teal-800">Step 03</p>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Secure QR Verification</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 font-normal">
                Handover is verified via secure QR and fallback PINs. Donors and NGOs receive full traceability, transparent reporting, and impact receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Role Callouts (Who it is for) */}
      <section id="community" className="bg-white border-y border-slate-200/80 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 ring-1 ring-emerald-600/15">
              Built for Everyone
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Who is ShareBite BD For?
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed font-normal">
              A united ecosystem of donors, verified non-profits, and rapid volunteers.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Donor */}
            <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-7 shadow-xs transition-all duration-200 hover:bg-white hover:shadow-md">
              <div>
                <span className="inline-flex rounded-xl bg-emerald-100/70 p-3 text-emerald-800 ring-1 ring-emerald-700/15">
                  <Utensils className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Food Donors</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 font-normal">
                  University cafeterias, restaurants, caterers, and corporate dining facilities wanting to eliminate food waste ethically and efficiently.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70">
                <Link
                  href={ROUTES.auth.registerDonor}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Register as Donor <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* NGO */}
            <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-7 shadow-xs transition-all duration-200 hover:bg-white hover:shadow-md">
              <div>
                <span className="inline-flex rounded-xl bg-amber-100/70 p-3 text-amber-800 ring-1 ring-amber-700/15">
                  <Building2 className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Charities & NGOs</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 font-normal">
                  Registered social organizations, orphanages, and community shelters seeking steady, high-quality, verified meals for beneficiaries.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70">
                <Link
                  href={ROUTES.auth.registerNgo}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Register as NGO <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Volunteer */}
            <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-7 shadow-xs transition-all duration-200 hover:bg-white hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div>
                <span className="inline-flex rounded-xl bg-teal-100/70 p-3 text-teal-800 ring-1 ring-teal-700/15">
                  <Users2 className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">Rescue Volunteers</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 font-normal">
                  Passionate individuals and youth groups ready to support local pickups, safe transport, and dignified meal distributions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/70">
                <Link
                  href={ROUTES.auth.registerVolunteer}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Join as Volunteer <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-emerald-950 to-emerald-900 px-6 py-14 sm:px-14 sm:py-18 text-center text-white shadow-xl ring-1 ring-white/10">
            <div className="absolute -top-24 -right-24 size-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
              Ready to turn excess food into community impact?
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-base text-emerald-100/85 leading-relaxed font-normal">
              Join ShareBite BD today. Whether donating food or distributing meals, every action counts towards zero hunger.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ROUTES.auth.roleSelection}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-bold text-slate-900 shadow-md hover:bg-emerald-50 transition-all active:scale-95"
              >
                Create Free Account <ArrowRight className="size-4" />
              </Link>
              <Link
                href={ROUTES.auth.login}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
              >
                Explore Demo Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <BrandLogo />
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
              <Link href={ROUTES.auth.login} className="hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link href={ROUTES.auth.roleSelection} className="hover:text-slate-900 transition-colors">
                Register
              </Link>
              <Link href={ROUTES.designSystem} className="hover:text-slate-900 transition-colors">
                Design System
              </Link>
              <Link href={ROUTES.preview.donor} className="hover:text-slate-900 transition-colors">
                Donor Preview
              </Link>
              <Link href={ROUTES.preview.ngo} className="hover:text-slate-900 transition-colors">
                NGO Preview
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} ShareBite BD. Smart surplus food rescue and redistribution initiative.
          </div>
        </div>
      </footer>
    </div>
  );
}
