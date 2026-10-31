import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AuthArtwork } from "@/components/auth/auth-artwork";
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
}

export function AuthShell({
  children,
  title = "Rescue food. Respect time. Measure impact.",
  description = "A trusted coordination platform for donors, verified organizations, and volunteers.",
  eyebrow = "Smart surplus food rescue",
  artworkVariant = "community",
  className,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50/70 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div
        className={cn(
          "w-full max-w-[1320px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 grid min-h-[720px] lg:grid-cols-[minmax(420px,0.95fr)_minmax(520px,1.05fr)]",
          className,
        )}
      >
        {/* Left Branding Panel */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-900 p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-20 surface-grid" />
          <div className="absolute -left-20 top-24 size-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <BrandLogo href={ROUTES.home} inverse />
            <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-900/30 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
              {eyebrow}
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/80 font-normal xl:text-base">
              {description}
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <AuthArtwork variant={artworkVariant} />
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                ["Urgency Match", "Real-time alert"],
                ["Safe Rescue", "Verified PIN / QR"],
                ["Zero Waste", "Measurable impact"],
              ].map(([label, helper]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="mt-0.5 text-[11px] text-emerald-200/70 font-medium">{helper}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Form Section */}
        <section className="relative flex min-h-full flex-col bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 lg:hidden">
            <BrandLogo href={ROUTES.home} />
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/15">
              ShareBite BD
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
            <div className="w-full max-w-lg">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
