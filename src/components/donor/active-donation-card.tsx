"use client";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { formatDonationQuantity } from "@/features/donations/donation-presentation";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { RescueClock } from "@/components/donor/rescue-clock";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardWorkCard } from "@/components/dashboard/dashboard-ui";
import ui from "@/components/dashboard/dashboard.module.css";
import { DonationStatus } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";
import styles from "./donor-mobile.module.css";
export function ActiveDonationCard({ donation }: { donation: DonationView }) {
  const tx = useUiText();
  const nextStep =
    donation.status === DonationStatus.PICKED_UP
      ? "The rider has collected this food. Follow the delivery progress."
      : donation.status === DonationStatus.DELIVERED
        ? "The NGO received this food. Distribution will be recorded next."
        : donation.status === DonationStatus.DISPUTED
          ? "This rescue is on hold while the report is reviewed."
          : undefined;
  return (
    <DashboardWorkCard
      data-testid="donor-active-donation"
      data-donation-id={donation.id}
      data-status={donation.status}
    >
      <div className={styles.activeTop}>
        <div className={styles.activePhoto}>
          <DonationPhoto
            donation={donation}
            hideSampleBadge
            fill
            sizes="(min-width:768px) 112px, 80px"
            className="object-cover"
          />
        </div>
        <div className={styles.activeCopy}>
          <StatusBadge status={donation.status} />
          <h3>{donation.title}</h3>
          <p>
            {formatDonationQuantity(donation)} · {donation.pickup.approximateArea}
          </p>
        </div>
      </div>
      <div className={styles.activeDeadline}>
        {nextStep ? (
          <p className={styles.nextStep}>{tx(nextStep)}</p>
        ) : (
          <RescueClock deadline={donation.safePickupDeadline} status={donation.status} compact />
        )}
      </div>
      <div className={styles.activeActions}>
        <Link
          href={ROUTES.donor.donation(donation.id)}
          className={ui.workAction}
          data-secondary="true"
        >
          <FileText size={15} aria-hidden="true" />
          {tx("Post details")}
        </Link>
        <Link
          href={ROUTES.donor.donationTracking(donation.id)}
          className={ui.workAction}
        >
          {tx("Track progress")}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </DashboardWorkCard>
  );
}
