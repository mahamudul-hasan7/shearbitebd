import { ArrowRight, MapPin, PackageOpen, Refrigerator, Utensils } from "lucide-react";
import Image from "next/image";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FOOD_CATEGORY_LABELS, STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import { DONATION_LIFECYCLE, DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";

const timelineLabels: Partial<Record<DonationStatus, string>> = {
  [DonationStatus.DRAFT]: "Draft",
  [DonationStatus.PUBLISHED]: "Posted",
  [DonationStatus.AVAILABLE]: "Available",
  [DonationStatus.RESERVED]: "Reserved",
  [DonationStatus.ASSIGNED]: "Assigned",
  [DonationStatus.PICKED_UP]: "Picked up",
  [DonationStatus.DELIVERED]: "Delivered",
  [DonationStatus.DISTRIBUTED]: "Distributed",
};

function quantityLabel(donation: DonationView) {
  return `${donation.quantity.value} ${donation.quantity.unit.toLowerCase().replaceAll("_", " ")}`;
}

export function ActiveDonationCard({ donation }: { donation: DonationView }) {
  const currentIndex = DONATION_LIFECYCLE.indexOf(donation.status);
  const imageUrl = donation.photoUrls[0] ?? "/images/donor-active-meal.png";

  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(17rem,0.85fr)_1.4fr]">
        <div className="relative min-h-64 overflow-hidden bg-brand-100 lg:min-h-full">
          <Image src={imageUrl} alt="Prepared rice, curry, and vegetable meal trays ready for pickup" fill sizes="(max-width: 1024px) 100vw, 36vw" className="object-cover" priority />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/85 to-transparent p-5 pt-16 text-white">
            <div className="flex flex-wrap gap-2"><Badge tone="danger">{donation.priority.toLowerCase()} priority</Badge><StatusBadge status={donation.status} /></div>
            <p className="mt-3 text-sm font-bold text-white/85">Posted by your donor profile</p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Active donation</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">{donation.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-600">{donation.description}</p>
            </div>
            <RescueClock deadline={donation.safePickupDeadline} compact />
          </div>

          <div className="mt-6 grid gap-3 xs:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-brand-50 p-3"><MapPin className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Pickup area</p><p className="mt-0.5 text-sm font-black text-ink-900">{donation.pickup.approximateArea}</p></div>
            <div className="rounded-2xl bg-brand-50 p-3"><Utensils className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Quantity</p><p className="mt-0.5 text-sm font-black text-ink-900">{quantityLabel(donation)}</p></div>
            <div className="rounded-2xl bg-brand-50 p-3"><Refrigerator className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Storage</p><p className="mt-0.5 text-sm font-black text-ink-900">{STORAGE_CONDITION_LABELS[donation.storageCondition]}</p></div>
            <div className="rounded-2xl bg-brand-50 p-3"><PackageOpen className="size-5 text-brand-700" /><p className="mt-2 text-xs text-muted-600">Category</p><p className="mt-0.5 text-sm font-black text-ink-900">{FOOD_CATEGORY_LABELS[donation.category]}</p></div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm font-black text-ink-900">Rescue progress</p><p className="mt-1 text-xs text-muted-600">Current status: {STATUS_META[donation.status].label}</p></div>
              <ButtonLink href={ROUTES.donor.donation(donation.id)} size="sm" variant="outline" rightIcon={<ArrowRight className="size-4" />}>View donation</ButtonLink>
            </div>
            <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7" aria-label="Donation status timeline">
              {DONATION_LIFECYCLE.slice(1).map((status, index) => {
                const lifecycleIndex = index + 1;
                const complete = lifecycleIndex < currentIndex;
                const current = lifecycleIndex === currentIndex;
                return (
                  <li key={status} aria-current={current ? "step" : undefined} className={`rounded-2xl border p-3 ${current ? "border-brand-500 bg-brand-50" : complete ? "border-success/20 bg-success-soft" : "border-line bg-canvas"}`}>
                    <span className={`grid size-7 place-items-center rounded-full text-xs font-black ${current ? "bg-brand-600 text-white" : complete ? "bg-success text-white" : "bg-white text-muted-600 ring-1 ring-line"}`}>{lifecycleIndex}</span>
                    <span className="mt-2 block text-xs font-bold text-ink-700">{timelineLabels[status]}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}
