import { ArrowRight, CalendarClock, MapPin, Navigation, Utensils } from "lucide-react";
import Image from "next/image";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { donationLifecycleProgress, isClosedDonation } from "@/features/donations/donation-management";
import { donationImageUrl, formatDonationDateTime, formatDonationQuantity } from "@/features/donations/donation-presentation";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";

const CLOCK_STATUSES = new Set<DonationStatus>([
  DonationStatus.PUBLISHED,
  DonationStatus.AVAILABLE,
  DonationStatus.RESERVED,
  DonationStatus.ASSIGNED,
]);

export function DonationManagementCard({ donation }: { donation: DonationView }) {
  const progress = donationLifecycleProgress(donation.status);

  return (
    <Card className="group overflow-hidden">
      <div className="grid md:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative min-h-52 overflow-hidden bg-brand-100 md:min-h-full">
          <Image src={donationImageUrl(donation)} alt="Prepared food associated with this donation listing" fill sizes="(max-width: 768px) 100vw, 13rem" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
          <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 bg-gradient-to-b from-brand-950/75 to-transparent p-4 pb-12"><StatusBadge status={donation.status} /><Badge tone={donation.priority === "URGENT" || donation.priority === "HIGH" ? "danger" : "accent"}>{donation.priority.toLowerCase()}</Badge></div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{FOOD_CATEGORY_LABELS[donation.category]}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-ink-900">{donation.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-600">{donation.description}</p>
            </div>
            {CLOCK_STATUSES.has(donation.status) && <RescueClock deadline={donation.safePickupDeadline} compact />}
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-brand-50 p-3"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><Utensils className="size-4 text-brand-600" />Quantity</dt><dd className="mt-1 font-black text-ink-900">{formatDonationQuantity(donation)}</dd></div>
            <div className="rounded-2xl bg-brand-50 p-3"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><MapPin className="size-4 text-brand-600" />Pickup area</dt><dd className="mt-1 font-black text-ink-900">{donation.pickup.approximateArea}</dd></div>
            <div className="rounded-2xl bg-brand-50 p-3"><dt className="flex items-center gap-2 text-xs font-bold text-muted-600"><CalendarClock className="size-4 text-brand-600" />Deadline</dt><dd className="mt-1 font-black text-ink-900">{formatDonationDateTime(donation.safePickupDeadline)}</dd></div>
          </dl>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-xs"><span className="font-bold text-ink-700">Lifecycle progress</span><span className="font-black text-brand-700">{progress}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100" role="progressbar" aria-label={`Donation lifecycle ${progress}% complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span className={`block h-full rounded-full ${isClosedDonation(donation.status) && donation.status !== DonationStatus.DISTRIBUTED ? "bg-muted-400" : "bg-brand-600"}`} style={{ width: `${progress}%` }} /></div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink href={ROUTES.donor.donation(donation.id)} size="sm" variant="outline" rightIcon={<ArrowRight className="size-4" />}>View details</ButtonLink>
            <ButtonLink href={ROUTES.donor.donationTracking(donation.id)} size="sm" variant="ghost" leftIcon={<Navigation className="size-4" />}>Track rescue</ButtonLink>
            <p className="break-all text-xs text-muted-600 sm:ml-auto">ID: <span className="font-mono font-bold text-ink-700">{donation.id}</span></p>
          </div>
        </div>
      </div>
    </Card>
  );
}
