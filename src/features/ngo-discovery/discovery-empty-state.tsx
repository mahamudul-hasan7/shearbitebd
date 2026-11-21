"use client";
import { SearchX } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import type { DiscoveryFilters } from "./types";
import styles from "./discovery.module.css";
export function DiscoveryEmptyState({
  resetFilters,
  filtered = true,
}: {
  filters?: DiscoveryFilters;
  resetFilters: () => void;
  filtered?: boolean;
}) {
  const tx = useUiText();
  return (
    <section className={styles.empty}>
      <SearchX size={34} />
      <h2>
        {tx(
          filtered
            ? "No food matches these filters"
            : "No food is available right now",
        )}
      </h2>
      <p>
        {tx(
          filtered
            ? "Try a wider distance or another category. All distances also includes food without a measured location."
            : "New donations will appear here when donors publish them. You can post a food need for your community.",
        )}
      </p>
      <div>
        {filtered && (
          <Button variant="outline" onClick={resetFilters}>
            {tx("Clear filters")}
          </Button>
        )}
        <ButtonLink href={ROUTES.ngo.newRequest}>
          {tx("Post a food need")}
        </ButtonLink>
      </div>
    </section>
  );
}
