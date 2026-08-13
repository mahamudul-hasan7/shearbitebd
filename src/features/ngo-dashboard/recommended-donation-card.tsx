"use client";

import Image from "next/image";
import { ArrowRight, CheckCircle2, MapPin, PackageOpen, ShieldCheck, Sparkles } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";

export function RecommendedDonationCard({ donation, matchScore, claiming, claimed, error, onClaim }: { donation: DonationView; matchScore: number; claiming: boolean; claimed: boolean; error?: string; onClaim: () => void }) {
  return <Card className="overflow-hidden">
    <div className="grid lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.25fr)]">
      <div className="relative min-h-72 bg-brand-100"><Image src={donation.photoUrls[0] ?? "/images/donor-active-meal.png"} alt="Covered prepared meal boxes ready for a food rescue" fill sizes="(max-width: 1024px) 100vw, 36vw" className="object-cover" priority /><div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4"><Badge tone="accent"><Sparkles className="size-3.5" />Recommended</Badge><Badge tone="success">{matchScore}% match</Badge></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/90 to-transparent p-5 pt-20 text-white"><p className="text-sm font-black">{donation.pickup.approximateArea}</p><p className="mt-1 text-xs text-white/75">Approximate location until claimed</p></div></div>
      <div className="p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.18em] text-accent-600">Best nearby match</p><h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900">{donation.title}</h2><p className="mt-2 text-sm leading-6 text-muted-600">{donation.description}</p></div><RescueClock deadline={donation.safePickupDeadline} compact /></div>
        <div className="mt-5 grid gap-3 xs:grid-cols-3"><div className="rounded-2xl bg-brand-50 p-3"><MapPin className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Distance</p><p className="mt-0.5 text-sm font-black text-ink-900">{donation.pickup.distanceKm?.toFixed(1)} km</p></div><div className="rounded-2xl bg-brand-50 p-3"><PackageOpen className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Quantity</p><p className="mt-0.5 text-sm font-black text-ink-900">{donation.quantity.estimatedMeals} meals</p></div><div className="rounded-2xl bg-brand-50 p-3"><ShieldCheck className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Priority</p><p className="mt-0.5 text-sm font-black text-ink-900">{donation.priority.toLowerCase()}</p></div></div>
        <div className="mt-5 rounded-2xl border border-line p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-ink-900">Claim status preview</p><Badge tone="info">{FOOD_CATEGORY_LABELS[donation.category]}</Badge></div><div className="mt-3 flex items-center gap-2 text-xs font-bold"><span className="rounded-full bg-success-soft px-3 py-1 text-success-strong">Available</span><ArrowRight className="size-3.5 text-muted-400" /><span className="rounded-full bg-warning-soft px-3 py-1 text-warning-strong">Reserved</span><ArrowRight className="size-3.5 text-muted-400" /><span className="rounded-full bg-info-soft px-3 py-1 text-info-strong">Assigned</span></div></div>
        {error && <Alert className="mt-4" tone="danger" title="Claim could not be completed" description={error} />}{claimed && <Alert className="mt-4" tone="success" title="Donation reserved" description="Your NGO now has a mock active claim. Exact pickup details are available in the authorized claim view." />}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Button fullWidth disabled={claiming || claimed} leftIcon={<CheckCircle2 className="size-4" />} onClick={onClaim}>{claiming ? "Claiming…" : claimed ? "Claimed" : "Claim donation"}</Button><ButtonLink href={ROUTES.ngo.discover} fullWidth variant="outline">Browse all food</ButtonLink></div>
      </div>
    </div>
  </Card>;
}
