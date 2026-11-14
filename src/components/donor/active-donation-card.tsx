"use client";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { RescueClock } from "@/components/donor/rescue-clock";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";
import styles from "./donor-mobile.module.css";
export function ActiveDonationCard({ donation }: { donation: DonationView }) {
  const tx = useUiText();
  return <article className={styles.active} data-testid="donor-active-donation" data-donation-id={donation.id} data-status={donation.status}>
    <div className={styles.activeTop}>
      <div className={styles.activePhoto}><DonationPhoto donation={donation} fill sizes="(min-width:768px) 112px, 80px" className="object-cover" /></div>
      <div className={styles.activeCopy}><StatusBadge status={donation.status} /><h3>{donation.title}</h3>
        <p>{donation.quantity.value} {tx(donation.quantity.unit)} · {donation.pickup.approximateArea}</p>
      </div>
    </div>
    <div className={styles.activeDeadline}><RescueClock deadline={donation.safePickupDeadline} compact /></div>
    <div className={styles.activeActions}>
      <Link href={ROUTES.donor.donation(donation.id)}><FileText size={15} aria-hidden="true" />{tx("Post details")}</Link>
      <Link href={ROUTES.donor.donationTracking(donation.id)}>{tx("Track progress")}<ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
  </article>;
}
