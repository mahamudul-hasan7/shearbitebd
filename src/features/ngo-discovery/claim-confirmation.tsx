"use client";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { STORAGE_CONDITION_LABELS } from "@/lib/constants/domain";
import type { DonationView } from "@/types/domain";
import { DiscoveryDialog } from "./discovery-dialog";
import { pickupDeadline } from "./discovery-model";
import styles from "./discovery.module.css";
export function ClaimConfirmation({
  donation,
  busy,
  error,
  available,
  onClose,
  onConfirm,
}: {
  donation: DonationView;
  busy: boolean;
  error?: string;
  available: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const tx = useUiText(),
    { language } = useLanguage(),
    locale = language === "bn" ? "bn-BD" : "en-BD";
  const time = (value: string | number) =>
    new Date(value).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  return (
    <DiscoveryDialog
      title={tx("Confirm your food claim")}
      onClose={onClose}
      busy={busy}
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {tx("Keep browsing")}
          </Button>
          <Button
            disabled={busy || !available}
            aria-busy={busy}
            onClick={onConfirm}
          >
            {tx(busy ? "Claiming…" : "Confirm claim")}
          </Button>
        </>
      }
    >
      <div className={styles.claimBody}>
        <h3>{donation.title}</h3>
        <p>
          {tx(
            "This reserves the whole donation for your NGO. Arrange collection from the claim page after confirmation.",
          )}
        </p>
        <dl>
          <div>
            <dt>{tx("Estimated meals")}</dt>
            <dd>{donation.quantity.estimatedMeals.toLocaleString(locale)}</dd>
          </div>
          <div>
            <dt>{tx("Pickup area")}</dt>
            <dd>{donation.pickup.approximateArea}</dd>
          </div>
          <div>
            <dt>{tx("Collection starts")}</dt>
            <dd>{time(donation.pickup.windowStart)}</dd>
          </div>
          <div>
            <dt>{tx("Collect before")}</dt>
            <dd>{time(pickupDeadline(donation))}</dd>
          </div>
          <div>
            <dt>{tx("Storage condition")}</dt>
            <dd>{tx(STORAGE_CONDITION_LABELS[donation.storageCondition])}</dd>
          </div>
          <div>
            <dt>{tx("Declared allergens")}</dt>
            <dd>
              {donation.allergens.length
                ? donation.allergens.join(", ")
                : tx("No allergens declared")}
            </dd>
          </div>
        </dl>
        <p>
          {tx(
            "Review food handling, allergens and collection timing for your recipients. Donor declarations are not an inspection certificate.",
          )}
        </p>
        {!available && (
          <p role="alert">
            {tx(
              "This donation can no longer be claimed. Close this window and refresh the details.",
            )}
          </p>
        )}
        {error && <p role="alert">{tx(error)}</p>}
      </div>
    </DiscoveryDialog>
  );
}
