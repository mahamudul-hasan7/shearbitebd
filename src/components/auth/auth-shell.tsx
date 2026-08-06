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
    <main className="min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:p-7">
      <div
        className={cn(
          "mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-panel border border-white/70 bg-white/90 shadow-dialog backdrop-blur sm:min-h-[calc(100vh-2.5rem)] lg:grid-cols-[minmax(380px,0.9fr)_minmax(560px,1.1fr)]",
          className,
        )}
      >
        <aside className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 opacity-35 surface-grid" />
          <div className="absolute -left-20 top-24 size-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-accent-500/25 blur-3xl" />

          <div className="relative z-10">
            <BrandLogo href="/splash" inverse />
            <p className="mt-14 text-xs font-bold uppercase tracking-[0.24em] text-brand-200">{eyebrow}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-tight xl:text-5xl">{title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-brand-100 xl:text-lg">{description}</p>
          </div>

          <div className="relative z-10 mt-auto pt-10">
            <AuthArtwork variant={artworkVariant} />
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                ["Fast", "Urgency-based rescue"],
                ["Safe", "Verified handovers"],
                ["Clear", "Measurable impact"],
              ].map(([label, helper]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="font-black">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-brand-100">{helper}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="auth-surface relative flex min-h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
            <BrandLogo href={ROUTES.auth.splash} />
            <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">UIU Pilot</span>
          </div>
          <div className="flex flex-1 items-center justify-center px-5 pb-8 pt-2 sm:px-8 sm:pb-10 lg:px-12 lg:py-10 xl:px-16">
            <div className="w-full max-w-2xl">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
