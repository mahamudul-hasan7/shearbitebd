"use client";

import { Building2, MapPin, Navigation, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatAddress } from "@/features/claims/claim-presentation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimRoutePreview({ details }: { details: ClaimCoordinationDetails }) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const pickup = details.donation.pickup.exactAddress;
  const delivery = details.deliveryAddress;

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
      <CardHeader
        title={isBn ? "উদ্ধার রুট ও ট্র্যাকিং প্রিভিউ" : "Rescue route"}
        description={
          isBn
            ? "খাদ্য সংগ্রহের স্থান থেকে এনজিও সেন্টারে পৌঁছে দেওয়ার গোপনীয়তা-সুরক্ষিত ডিজিটাল রুট ম্যাপ।"
            : "A privacy-aware visual preview for frontend coordination; this is not live navigation."
        }
        action={<Badge tone="info">{isBn ? "সিমুলেটেড রুট" : "Mock route"}</Badge>}
      />
      <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-60 overflow-hidden rounded-3xl border border-emerald-100 bg-[radial-gradient(circle_at_1px_1px,rgb(167_204_181_/_0.45)_1px,transparent_0)] bg-[length:22px_22px]">
          <div className="absolute left-[12%] top-[28%] grid size-12 place-items-center rounded-full bg-emerald-700 text-white shadow-lg">
            <MapPin className="size-6" />
          </div>
          <div className="absolute bottom-[22%] right-[12%] grid size-12 place-items-center rounded-full bg-amber-500 text-white shadow-lg">
            <Building2 className="size-6" />
          </div>
          <svg aria-hidden="true" viewBox="0 0 500 230" className="absolute inset-0 size-full">
            <path
              d="M80 75 C165 10 235 190 315 105 S405 160 435 165"
              fill="none"
              stroke="rgb(16 185 129)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="12 10"
            />
          </svg>
          <div className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-blue-600 text-white shadow-md animate-pulse">
            <Navigation className="size-4" />
          </div>
        </div>

        <div className="grid content-center gap-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <MapPin className="size-4" />
              <p className="text-xs font-black uppercase tracking-wide">
                {isBn ? "পিকআপ পয়েন্ট (খাদ্যদাতা)" : "Pickup"}
              </p>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {pickup ? formatAddress(pickup) : details.donation.pickup.approximateArea}
            </p>
          </div>

          <div className="flex items-center gap-3 px-3 text-slate-500">
            <Route className="size-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">
              {isBn
                ? `আনুমানিক ${details.donation.pickup.distanceKm?.toFixed(1) ?? "--"} কিমি সমন্বয় রুট`
                : `Approx. ${details.donation.pickup.distanceKm?.toFixed(1) ?? "--"} km coordination route`}
            </span>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Building2 className="size-4" />
              <p className="text-xs font-black uppercase tracking-wide">
                {isBn ? "ডেলিভারি কেন্দ্র (এনজিও শেল্টার)" : "Delivery"}
              </p>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {formatAddress(delivery)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
