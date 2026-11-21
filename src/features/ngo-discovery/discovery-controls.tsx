"use client";
import { useState } from "react";
import Link from "next/link";
import { LayoutList, Map, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { ROUTES } from "@/lib/routes";
import { FoodCategory } from "@/lib/constants/domain";
import type { DiscoveryFilters, DiscoveryMode } from "./types";
import { DiscoveryDialog } from "./discovery-dialog";
import { DiscoveryFilterFields } from "./discovery-filters";
import styles from "./discovery.module.css";
function DiscoverySearch({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (value: string) => void;
}) {
  const tx = useUiText();
  const [draft, setDraft] = useState(value);
  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft);
      }}
    >
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        aria-label={tx("Search available food")}
        placeholder={tx("Food, donor or pickup area")}
        value={draft}
        maxLength={160}
        onChange={(event) => setDraft(event.target.value)}
      />
      {draft && (
        <button
          type="button"
          className={styles.iconButton}
          aria-label={tx("Clear search")}
          onClick={() => {
            setDraft("");
            onSearch("");
          }}
        >
          <X size={17} />
        </button>
      )}
      <button
        type="submit"
        className={styles.iconButton}
        aria-label={tx("Search")}
      >
        <Search size={18} />
      </button>
    </form>
  );
}
export function DiscoveryControls({
  mode,
  queryString,
  filters,
  activeFilterCount,
  resultCount,
  updateFilter,
  resetFilters,
}: {
  mode: DiscoveryMode;
  queryString: string;
  filters: DiscoveryFilters;
  activeFilterCount: number;
  resultCount: number;
  updateFilter: <K extends keyof DiscoveryFilters>(
    key: K,
    value: DiscoveryFilters[K],
  ) => void;
  resetFilters: () => void;
}) {
  const tx = useUiText(),
    { language } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  const query = queryString ? `?${queryString}` : "";
  return (
    <section
      className={styles.controls}
      aria-label={tx("Find and filter food")}
    >
      <div className={styles.controlRow}>
        <DiscoverySearch
          key={filters.search}
          value={filters.search}
          onSearch={(value) => updateFilter("search", value)}
        />
        <label className={styles.sort}>
          <span>{tx("Sort")}</span>
          <select
            className={styles.pageSelect}
            aria-label={tx("Sort donations")}
            value={filters.sort}
            onChange={(event) =>
              updateFilter(
                "sort",
                event.target.value as DiscoveryFilters["sort"],
              )
            }
          >
            <option value="RECOMMENDED">{tx("Recommended")}</option>
            <option value="NEAREST">{tx("Nearest first")}</option>
            <option value="DEADLINE">{tx("Deadline soonest")}</option>
            <option value="QUANTITY">{tx("Most meals")}</option>
            <option value="RECENT">{tx("Recently published")}</option>
          </select>
        </label>
        <button
          type="button"
          className={styles.filterButton}
          aria-label={tx("Filters")}
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={17} />
          <span className={styles.filterText}>{tx("Filters")}</span>
          {activeFilterCount ? ` (${number(activeFilterCount)})` : ""}
        </button>
        <nav className={styles.viewToggle} aria-label={tx("Discovery view")}>
          <Link
            href={ROUTES.ngo.discover + query}
            aria-label={tx("List view")}
            aria-current={mode === "list" ? "page" : undefined}
          >
            <LayoutList size={18} />
            <span>{tx("List")}</span>
          </Link>
          <Link
            href={ROUTES.ngo.discoverMap + query}
            aria-label={tx("Map view")}
            aria-current={mode === "map" ? "page" : undefined}
          >
            <Map size={18} />
            <span>{tx("Map")}</span>
          </Link>
        </nav>
      </div>
      <div className={styles.quickRow}>
        <div className={styles.chips} aria-label={tx("Quick food categories")}>
          {(
            [
              { value: "ALL", text: "All food" },
              { value: FoodCategory.COOKED_MEAL, text: "Cooked meals" },
              { value: FoodCategory.BAKERY, text: "Bakery" },
              { value: FoodCategory.PRODUCE, text: "Fruit & vegetables" },
            ] as const
          ).map((category) => (
            <button
              type="button"
              key={category.value}
              className={styles.chip}
              aria-pressed={filters.category === category.value}
              onClick={() => updateFilter("category", category.value)}
            >
              {tx(category.text)}
            </button>
          ))}
        </div>
        <div className={styles.controlFooter}>
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{tx("{0} donations found", number(resultCount))}</strong>
            {activeFilterCount
              ? ` · ${tx("{0} filters active", number(activeFilterCount))}`
              : ""}
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              className={styles.clear}
              onClick={resetFilters}
            >
              {tx("Clear filters")}
            </button>
          )}
        </div>
      </div>
      {showFilters && (
        <DiscoveryDialog
          title={tx("Filter available food")}
          onClose={() => setShowFilters(false)}
          footer={
            <Button onClick={() => setShowFilters(false)}>
              {tx("Show {0} donations", number(resultCount))}
            </Button>
          }
        >
          <DiscoveryFilterFields
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
          />
        </DiscoveryDialog>
      )}
    </section>
  );
}
