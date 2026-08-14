"use client";

import Image from "next/image";
import { Bookmark, Clock3, MapPin, PackageOpen, Refrigerator, ShieldCheck } from "lucide-react";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { donationImageUrl, formatDonationDateTime } from "@/features/donations/donation-presentation";
import { FOOD_CATEGORY_LABELS, PriorityLevel, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { NGODiscoveryItem } from "@/services";

function priorityTone(priority: PriorityLevel): BadgeTone {
  if (priority === PriorityLevel.URGENT) return "danger";
  if (priority === PriorityLevel.HIGH) return "warning";
  if (priority === PriorityLevel.MEDIUM) return "info";
  return "neutral";
}

export function DonationDiscoveryCard({ item, saved, onToggleSaved }: { item: NGODiscoveryItem; saved: boolean; onToggleSaved: () => void }) {
  const donation = item.donation;
  return <Card className="overflow-hidden"><div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
    <div className="relative min-h-56 bg-brand-100"><Image src={donationImageUrl(donation)} alt="Prepared surplus food packaged for rescue" fill sizes="(max-width: 768px) 100vw, 240px" className="object-cover" /><div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3"><Badge tone={priorityTone(donation.priority)}>{donation.priority.toLowerCase()}</Badge><Badge tone="success">{item.matchScore}% match</Badge></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/90 to-transparent p-4 pt-16 text-white"><p className="text-sm font-black">{item.donorOrganization}</p><p className="mt-1 text-xs text-white/75">Verified donor · approximate area only</p></div></div>
    <div className="p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge>{FOOD_CATEGORY_LABELS[donation.category]}</Badge>{item.eligibility.eligible && <Badge tone="success"><ShieldCheck className="size-3.5" />Eligible</Badge>}</div><h2 className="mt-3 text-xl font-black text-ink-900">{donation.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-600">{donation.description}</p></div><RescueClock deadline={donation.safePickupDeadline} compact /></div>
      <div className="mt-5 grid gap-2 xs:grid-cols-2 xl:grid-cols-4"><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-ink-700"><MapPin className="size-4 text-brand-700" />{donation.pickup.distanceKm?.toFixed(1)} km · {donation.pickup.approximateArea}</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-ink-700"><PackageOpen className="size-4 text-brand-700" />{donation.quantity.estimatedMeals} meals</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-ink-700"><Refrigerator className="size-4 text-brand-700" />{STORAGE_CONDITION_LABELS[donation.storageCondition]}</p><p className="flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-xs font-bold text-ink-700"><Clock3 className="size-4 text-brand-700" />Prepared {formatDonationDateTime(donation.preparationTime)}</p></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" size="sm" leftIcon={<Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />} onClick={onToggleSaved}>{saved ? "Saved" : "Save"}</Button><ButtonLink href={ROUTES.ngo.donation(donation.id)} size="sm">View details</ButtonLink></div>
    </div>
  </div></Card>;
}
