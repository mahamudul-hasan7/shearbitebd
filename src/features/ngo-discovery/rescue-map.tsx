"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import type { NGODiscoveryItem } from "@/services";
import { RealInteractiveMap } from "./real-interactive-map";
import { DonationDiscoveryCard } from "./donation-discovery-card";
import { useSavedDonations } from "./use-saved-donations";
import styles from "./discovery.module.css";
export function RescueMap({
  items,
  queryString = "",
  now = 0,
}: {
  items: NGODiscoveryItem[];
  queryString?: string;
  now?: number;
}) {
  const tx = useUiText(),
    { language } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>();
  const { savedIds, toggleSaved } = useSavedDonations();
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  const mapped = items.filter(
    (item) => item.donation.pickup.approximateCoordinates,
  );
  const selected =
    items.find((item) => item.donation.id === selectedId) || items[0];
  return (
    <div className={styles.mapLayout}>
      <section className={styles.mapCanvas} aria-label={tx("Food locations")}>
        <div className={styles.mapHeader}>
          <span>
            <MapPin size={16} className="mr-1 inline" />
            {tx("Approximate pickup locations")}
          </span>
          <span>{tx("{0} mapped", number(mapped.length))}</span>
        </div>
        <RealInteractiveMap
          items={items}
          selectedId={selected?.donation.id}
          onSelect={setSelectedId}
        />
        <p>
          {tx(
            "Donor locations are approximate. Exact pins and navigation unlock only after a successful claim.",
          )}
        </p>
        {items.length > mapped.length && (
          <p>
            {tx(
              "{0} donations have no saved pin. Select them from the list; no location has been guessed.",
              number(items.length - mapped.length),
            )}
          </p>
        )}
      </section>
      <section
        className={styles.mapResults}
        aria-label={tx("Choose a donation on the map")}
      >
        {items.map(({ donation }) => (
          <button
            type="button"
            key={donation.id}
            className={styles.mapItem}
            aria-pressed={selected?.donation.id === donation.id}
            onClick={() => setSelectedId(donation.id)}
          >
            <strong>{donation.title}</strong>
            <span>
              {donation.pickup.approximateArea} ·{" "}
              {tx("{0} meals", number(donation.quantity.estimatedMeals))}
            </span>
            <span>
              {donation.pickup.approximateCoordinates
                ? tx("Approximate map pin")
                : tx("Pin not set")}
              {donation.pickup.distanceKm !== undefined
                ? ` · ${tx("~{0} km straight line", number(Number(donation.pickup.distanceKm.toFixed(1))))}`
                : ""}
            </span>
          </button>
        ))}
      </section>
      {selected && (
        <div
          className={styles.mapSelection}
          aria-label={tx("Selected donation")}
        >
          <DonationDiscoveryCard
            item={selected}
            now={now}
            saved={savedIds.includes(selected.donation.id)}
            onToggleSaved={() => toggleSaved(selected.donation.id)}
            queryString={queryString}
          />
        </div>
      )}
    </div>
  );
}
