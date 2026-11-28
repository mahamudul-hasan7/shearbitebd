"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  Utensils,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { LiveIcon } from "@/components/motion/live-icon";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { requestService, toServiceError } from "@/services";
import type { FoodRequest } from "@/types/domain";

export function RequestSubmitted({ requestId }: { requestId?: string }) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const { session } = useMockAuth();
  const [snapshot, setSnapshot] = useState<{ requestId: string; request?: FoodRequest; error?: string }>();
  const current = snapshot?.requestId === requestId ? snapshot : undefined;
  const request = current?.request;
  const error = current?.error;
  const loading = Boolean(requestId) && !current;

  useEffect(() => {
    if (!requestId) return;
    const controller = new AbortController();
    requestService
      .getById(requestId, { signal: controller.signal })
      .then((item) => {
        if (!controller.signal.aborted) setSnapshot({ requestId, request: item });
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setSnapshot({ requestId, error: toServiceError(caught).message });
      });
    return () => controller.abort();
  }, [requestId]);

  const name = session?.displayName || "NGO account";
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NG";

  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.requests}
      title={tx("Food request published")}
      description={tx("আপনার প্রয়োজন database-এ সংরক্ষিত হয়েছে।")}
      profileName={name}
      avatarInitials={initials}
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <ButtonLink
          href={ROUTES.ngo.requests}
          size="sm"
          variant="outline"
          leftIcon={<ClipboardList className="size-4" />}
        >
          {tx("My requests")}
        </ButtonLink>
      }
    >
      {loading && <LoadingSpinner />}

      {!loading && (
        <div className="grid gap-6">
          <Card className="overflow-hidden border-emerald-200/80">
            <CardHeader
              title={request?.title || tx("Request reference")}
              description={requestId || tx("Saved in ShareBite BD registry")}
              action={
                <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50/70">
                  <LiveIcon icon={CheckCircle2} motion="once" size={26} />
                </span>
              }
            />
            <CardContent className="grid gap-5">
              {error && (
                <Alert
                  tone="danger"
                  title={tx("Request details could not load")}
                  description={tx(error)}
                  action={
                    <ButtonLink href={ROUTES.ngo.requests} size="sm" variant="outline">
                      <RefreshCw className="size-3.5" />
                      {tx("My requests")}
                    </ButtonLink>
                  }
                />
              )}

              {request && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={request.status} />
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                      #{request.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/55 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
                        <Utensils className="size-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                          {tx("Meals")}
                        </p>
                        <p className="text-lg font-bold text-ink-900">
                          {request.mealsNeeded.toLocaleString(locale)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/55 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-600 text-white">
                        <Users className="size-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">
                          {tx("People")}
                        </p>
                        <p className="text-lg font-bold text-ink-900">
                          {request.peopleToServe.toLocaleString(locale)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/55 p-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-600 text-white">
                        <MapPin className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
                          {tx("Delivery area")}
                        </p>
                        <p className="truncate text-sm font-bold text-ink-900">
                          {request.deliveryLocation.area}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="liquid-glass-tile rounded-2xl p-4 text-sm leading-relaxed text-ink-800">
                    {tx(
                      "Suitable donation বেছে reserve করুন। Volunteer handover, NGO receipt ও actual distribution-এর মাধ্যমে request পূরণ হবে।",
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
                {request && (
                  <ButtonLink
                    href={ROUTES.ngo.request(request.id)}
                    rightIcon={<ArrowRight className="size-4" />}
                  >
                    {tx("Find suitable donations")}
                  </ButtonLink>
                )}
                <ButtonLink href={ROUTES.ngo.requests} variant="outline">
                  {tx("My requests")}
                </ButtonLink>
                <ButtonLink
                  href={ROUTES.ngo.newRequest}
                  variant="ghost"
                  leftIcon={<Plus className="size-4" />}
                >
                  {tx("New food request")}
                </ButtonLink>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PortalShell>
  );
}
