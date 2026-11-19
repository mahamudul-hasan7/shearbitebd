"use client";

import Link from "next/link";
import { CheckCircle2, HandHeart, MapPin, PackageOpen } from "lucide-react";
import { LiveIcon } from "@/components/motion/live-icon";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { RescueClock } from "@/components/donor/rescue-clock";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { FOOD_CATEGORY_LABELS } from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { DonationView } from "@/types/domain";
import ui from "@/components/dashboard/dashboard.module.css";
import styles from "./ngo-dashboard.module.css";

export function RecommendedDonationCard({
  donation,
  claiming,
  claimed,
  error,
  onClaim,
  canClaim = true,
  disabled = false,
}: {
  donation: DonationView;
  matchScore: number;
  claiming: boolean;
  claimed: boolean;
  error?: string;
  onClaim: () => void;
  canClaim?: boolean;
  disabled?: boolean;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  return (
    <article
      className={styles.recommend}
      data-testid="ngo-recommended-food"
      data-donation-id={donation.id}
    >
      <div className={styles.recommendImage}>
        <DonationPhoto
          donation={donation}
          fill
          sizes="(max-width:639px) 100vw,35vw"
          className={styles.recommendPhoto}
        />
      </div>
      <div className={styles.recommendBody}>
        <div className={styles.recommendTop}>
          <Badge tone="neutral">
            {tx(FOOD_CATEGORY_LABELS[donation.category])}
          </Badge>
          <RescueClock deadline={donation.safePickupDeadline} compact />
        </div>
        <h3>{donation.title}</h3>
        <p className={styles.recommendDescription}>{donation.description}</p>
        <div className={styles.foodFacts}>
          <span>
            <PackageOpen size={15} aria-hidden="true" />
            {tx(
              "{0} declared meals",
              donation.quantity.estimatedMeals.toLocaleString(locale),
            )}
          </span>
          <span>
            <MapPin size={15} aria-hidden="true" />
            {donation.pickup.distanceKm === undefined
              ? donation.pickup.approximateArea
              : tx(
                  "About {0} km away, straight line",
                  donation.pickup.distanceKm.toLocaleString(locale, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }),
                )}
          </span>
        </div>
        {!canClaim && (
          <p className={styles.approval}>
            {tx("NGO approval is needed before claiming food.")}{" "}
            <Link href={ROUTES.ngo.verification}>
              {tx("View verification")}
            </Link>
          </p>
        )}
        {error && (
          <Alert
            tone="danger"
            title={tx("Claim could not be completed")}
            description={error}
          />
        )}
        {claimed && (
          <div className="flex items-start gap-2">
            <LiveIcon
              icon={CheckCircle2}
              motion="once"
              size={25}
              className="shrink-0 text-emerald-700"
            />
            <Alert
              tone="success"
              title={tx("Donation reserved")}
              description={tx(
                "Your NGO now has a saved active claim. Exact pickup details are available in the authorized claim view.",
              )}
            />
          </div>
        )}
        <div className={styles.recommendActions}>
          <Button
            className={`${ui.primaryAction} ${styles.recommendButton}`}
            disabled={claiming || claimed || !canClaim || disabled}
            leftIcon={
              claiming ? undefined : (
                <LiveIcon
                  icon={claimed ? CheckCircle2 : HandHeart}
                  motion={claimed ? "once" : "interaction"}
                  size={19}
                />
              )
            }
            onClick={onClaim}
          >
            {tx(
              claiming ? "Claiming…" : claimed ? "Claimed" : "Claim donation",
            )}
          </Button>
          <ButtonLink
            className={`${ui.secondaryAction} ${styles.recommendButton}`}
            href={ROUTES.ngo.donation(donation.id)}
            variant="outline"
          >
            {tx("View food details")}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
