"use client";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Refrigerator,
  ShieldCheck,
  Soup,
  Utensils,
  X,
} from "lucide-react";
import Link from "next/link";
import { DonationPhoto } from "@/components/donation/donation-photo";
import { ButtonLink } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  FOOD_CATEGORY_LABELS,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import { ROUTES } from "@/lib/routes";
import type { NGODiscoveryItem } from "@/services";
import { acceptedCategory, pickupDeadline } from "./discovery-model";
import styles from "./discovery.module.css";
export function DonationDiscoveryCard({
  item,
  saved,
  onToggleSaved,
  queryString = "",
  now = 0,
}: {
  item: NGODiscoveryItem;
  saved: boolean;
  onToggleSaved: () => void;
  queryString?: string;
  now?: number;
}) {
  const tx = useUiText(),
    { language } = useLanguage();
  const donation = item.donation;
  const locale = language === "bn" ? "bn-BD" : "en-BD",
    number = (value: number) => value.toLocaleString(locale);
  const deadline = pickupDeadline(donation),
    remaining = Math.max(0, Math.floor((deadline - now) / 1000));
  const clock = now
    ? [
        Math.floor(remaining / 3600),
        Math.floor((remaining % 3600) / 60),
        remaining % 60,
      ]
        .map((value) =>
          value.toLocaleString(locale, {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
        )
        .join(":")
    : "--:--:--";
  const distance = donation.pickup.distanceKm;
  const href =
    ROUTES.ngo.donation(donation.id) + (queryString ? `?${queryString}` : "");
  const blocked = item.eligibility.checks.find((check) => !check.passed);
  return (
    <article
      className={styles.card}
      data-testid="discovery-card"
      data-donation-id={donation.id}
    >
      <div className={styles.cardGrid}>
        <div className={styles.photo}>
          <DonationPhoto
            donation={donation}
            fill
            sizes="(max-width: 639px) 100vw, 180px"
          />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardTop}>
            <span className={styles.category}>
              <Utensils size={15} />
              {tx(FOOD_CATEGORY_LABELS[donation.category])}
            </span>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={tx(
                saved ? "Remove saved donation: {0}" : "Save donation: {0}",
                donation.title,
              )}
              aria-pressed={saved}
              onClick={onToggleSaved}
            >
              <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <h3>
            <Link href={href}>{donation.title}</Link>
          </h3>
          <p className={styles.donor}>{item.donorOrganization}</p>
          <div className={styles.facts}>
            <div className={styles.fact}>
              <span>
                <Soup size={14} />
                {tx("Estimated meals")}
              </span>
              <strong>{number(donation.quantity.estimatedMeals)}</strong>
              <small>{tx("Donor estimate")}</small>
            </div>
            <div className={styles.fact}>
              <span>
                <MapPin size={14} />
                {tx("Pickup area")}
              </span>
              <strong>{donation.pickup.approximateArea}</strong>
              <small>
                {distance === undefined
                  ? tx("Distance unmeasured")
                  : tx(
                      "~{0} km straight line",
                      number(Number(distance.toFixed(1))),
                    )}
              </small>
            </div>
            <div className={styles.fact}>
              <span>
                <Clock3 size={14} />
                {tx("Time to collect")}
              </span>
              <strong
                className={styles.clock}
                data-urgent={now > 0 && remaining < 7200}
                role="timer"
                aria-live="off"
              >
                {clock}
              </strong>
              <small>
                {tx(
                  "Collect before {0}",
                  new Date(deadline).toLocaleTimeString(locale, {
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                )}
              </small>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <div>
          <p className={styles.fit} data-blocked={!!blocked}>
            <ShieldCheck size={15} />
            {tx(
              blocked
                ? blocked.description
                : acceptedCategory(item)
                  ? "Your NGO accepts this food category"
                  : "Review this donation before claiming",
            )}
          </p>
          <p className={styles.fit}>
            <Refrigerator size={15} />
            {tx(STORAGE_CONDITION_LABELS[donation.storageCondition])}
          </p>
        </div>
        <ButtonLink
          href={href}
          variant="outline"
          rightIcon={<ArrowUpRight size={16} />}
        >
          {tx("View details & claim")}
        </ButtonLink>
      </div>
      <details className={styles.matchDetails}>
        <summary>
          {tx("Why this food fits")}
          <ChevronDown size={15} />
        </summary>
        <ul>
          {item.eligibility.checks.map((check) => (
            <li key={check.label}>
              {check.passed ? <Check size={15} /> : <X size={15} />}
              <span>
                <strong>{tx(check.label)}:</strong> {tx(check.description)}
              </span>
            </li>
          ))}
          <li>
            <MapPin size={15} />
            {distance === undefined
              ? tx("Add saved location pins to compare distance.")
              : tx(
                  "Distance is approximate. Check pickup timing and transport before claiming.",
                )}
          </li>
        </ul>
      </details>
    </article>
  );
}
