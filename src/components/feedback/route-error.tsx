"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function RouteError({
  error,
  reset,
  portal,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  portal: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <section className="w-full max-w-xl rounded-card border border-brand-100 bg-white p-6 text-center shadow-card sm:p-10">
        <BrandLogo className="justify-center" />
        <span className="mx-auto mt-8 grid size-16 place-items-center rounded-full bg-warning/10 text-warning">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-brand-600">{portal}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page could not be loaded. Try again, or return to the ShareBite BD welcome page.
        </p>
        {error.digest && <p className="mt-3 text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button leftIcon={<RefreshCw className="size-4" aria-hidden="true" />} onClick={reset}>
            Try again
          </Button>
          <ButtonLink href={ROUTES.auth.splash} variant="outline">
            Back to welcome
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
