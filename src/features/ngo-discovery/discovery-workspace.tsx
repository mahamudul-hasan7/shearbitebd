"use client";
import {
  Clock3,
  HeartHandshake,
  MapPin,
  Plus,
  RefreshCw,
  Soup,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import { DiscoveryControls } from "./discovery-controls";
import { DiscoveryFilterFields } from "./discovery-filters";
import { DiscoveryEmptyState } from "./discovery-empty-state";
import { DonationDiscoveryCard } from "./donation-discovery-card";
import { RescueMap } from "./rescue-map";
import { useNgoDiscovery } from "./use-ngo-discovery";
import { useSavedDonations } from "./use-saved-donations";
import { pickupDeadline } from "./discovery-model";
import type { DiscoveryMode } from "./types";
import styles from "./discovery.module.css";
export function DiscoveryWorkspace({ mode }: { mode: DiscoveryMode }) {
  const tx = useUiText(),
    { language } = useLanguage(),
    { session } = useMockAuth();
  const discovery = useNgoDiscovery(),
    { state, filteredItems, activeFilterCount, now, retry } = discovery;
  const { savedIds, toggleSaved } = useSavedDonations();
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  const metrics = [
    { text: "Available donations", value: filteredItems.length, icon: Soup },
    {
      text: "Estimated meals",
      value: filteredItems.reduce(
        (sum, item) => sum + item.donation.quantity.estimatedMeals,
        0,
      ),
      icon: UsersRound,
    },
    {
      text: "Pickup within 2 hours",
      value: filteredItems.filter(
        (item) => pickupDeadline(item.donation) - now <= 7_200_000,
      ).length,
      icon: Clock3,
    },
  ];
  return (
    <PortalShell
      role="ngo"
      activeHref={
        mode === "list" ? ROUTES.ngo.discover : ROUTES.ngo.discoverMap
      }
      title={tx("Discover food")}
      description={tx(
        "Find a donation your community can use, then review it before claiming.",
      )}
      profileName={session?.displayName || "NGO account"}
      profileDescription={tx("Food rescue partner")}
      notificationHref={ROUTES.ngo.notifications}
      actions={
        <ButtonLink
          href={ROUTES.ngo.newRequest}
          variant="outline"
          leftIcon={<Plus size={17} />}
        >
          {tx("Post a food need")}
        </ButtonLink>
      }
      compactHeader
    >
      <div className={styles.workspace}>
        {state.data && (
          <section
            className={styles.metrics}
            aria-label={tx("Matching food overview")}
          >
            {metrics.map(({ text, value, icon: Icon }) => (
              <div className={styles.metric} key={text}>
                <div>
                  <span>{tx(text)}</span>
                  <Icon size={20} />
                </div>
                <strong>{number(value)}</strong>
              </div>
            ))}
          </section>
        )}
        <DiscoveryControls
          mode={mode}
          {...discovery}
          resultCount={filteredItems.length}
        />
        <div className={styles.locationNote}>
          <details>
            <summary>
              <MapPin size={15} />
              {tx("Location & pickup privacy")}
            </summary>
            <p>
              {tx(
                "Nearby search uses your primary NGO address. Exact pickup details unlock after a successful claim.",
              )}
            </p>
          </details>
          <a href={ROUTES.ngo.addresses}>{tx("Manage address pins")}</a>
        </div>
        {state.error && (
          <div role="alert" className={styles.notice}>
            <p>
              {tx(
                state.data
                  ? "Could not refresh food. Saved results are shown; open a donation to check current availability."
                  : "Available food could not load. Check your connection and try again.",
              )}
            </p>
            <Button
              variant="outline"
              onClick={retry}
              leftIcon={<RefreshCw size={16} />}
            >
              {tx("Try again")}
            </Button>
          </div>
        )}
        {!state.data && !state.error && (
          <div
            role="status"
            aria-label={tx("Loading available food")}
            className={styles.results}
          >
            <span className="sr-only">{tx("Loading available food")}</span>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        )}
        {state.data && (
          <div className={styles.layout}>
            <aside
              className={styles.sidebar}
              aria-label={tx("Desktop food filters")}
            >
              <div className={styles.sidebarHeader}>
                <h2>{tx("Refine your search")}</h2>
              </div>
              <DiscoveryFilterFields {...discovery} />
            </aside>
            <section
              className={styles.results}
              aria-label={tx("Available food results")}
            >
              {discovery.filters.sort === "RECOMMENDED" && (
                <details className={styles.recommendation}>
                  <summary>
                    <HeartHandshake size={17} />
                    {tx("How recommendations work")}
                  </summary>
                  <p>
                    {tx(
                      "Your accepted food categories come first, followed by pickups due within 2 hours and known distance. Unmeasured distances stay visible under All distances. This is a practical shortlist; review the donor details yourself.",
                    )}
                  </p>
                </details>
              )}
              {filteredItems.length === 0 ? (
                <DiscoveryEmptyState
                  resetFilters={discovery.resetFilters}
                  filtered={activeFilterCount > 0}
                />
              ) : mode === "list" ? (
                filteredItems.map((item) => (
                  <DonationDiscoveryCard
                    key={item.donation.id}
                    item={item}
                    now={now}
                    saved={savedIds.includes(item.donation.id)}
                    onToggleSaved={() => toggleSaved(item.donation.id)}
                    queryString={discovery.queryString}
                  />
                ))
              ) : (
                <RescueMap
                  items={filteredItems}
                  queryString={discovery.queryString}
                  now={now}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
