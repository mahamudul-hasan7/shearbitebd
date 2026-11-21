"use client";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import {
  FoodCategory,
  FOOD_CATEGORY_LABELS,
  DietaryType,
  DIETARY_TYPE_LABELS,
  PriorityLevel,
  PRIORITY_META,
  StorageCondition,
  STORAGE_CONDITION_LABELS,
} from "@/lib/constants/domain";
import type { DiscoveryFilters } from "./types";
import styles from "./discovery.module.css";
export function DiscoveryFilterFields({
  filters,
  updateFilter,
  resetFilters,
}: {
  filters: DiscoveryFilters;
  updateFilter: <K extends keyof DiscoveryFilters>(
    key: K,
    value: DiscoveryFilters[K],
  ) => void;
  resetFilters: () => void;
}) {
  const tx = useUiText(),
    { language } = useLanguage();
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  return (
    <div className={styles.filterFields}>
      <fieldset>
        <legend>{tx("Distance radius")}</legend>
        <div className={styles.radii}>
          {[0, 3, 5, 10, 15, 25].map((km) => (
            <button
              type="button"
              className={styles.chip}
              key={km}
              aria-pressed={filters.radiusKm === km}
              onClick={() => updateFilter("radiusKm", km)}
            >
              {km ? `${number(km)} ${tx("km")}` : tx("All distances")}
            </button>
          ))}
        </div>
      </fieldset>
      <p>
        {tx(
          "Distance uses saved pins and is a straight-line estimate. All distances includes unmeasured locations.",
        )}
      </p>
      <Select
        label={tx("Food category")}
        value={filters.category}
        onChange={(event) =>
          updateFilter(
            "category",
            event.target.value as DiscoveryFilters["category"],
          )
        }
      >
        <option value="ALL">{tx("All food categories")}</option>
        {Object.values(FoodCategory).map((value) => (
          <option key={value} value={value}>
            {tx(FOOD_CATEGORY_LABELS[value])}
          </option>
        ))}
      </Select>
      <Select
        label={tx("Dietary type")}
        value={filters.dietary}
        onChange={(event) =>
          updateFilter(
            "dietary",
            event.target.value as DiscoveryFilters["dietary"],
          )
        }
      >
        <option value="ALL">{tx("Any dietary type")}</option>
        {Object.values(DietaryType).map((value) => (
          <option key={value} value={value}>
            {tx(DIETARY_TYPE_LABELS[value])}
          </option>
        ))}
      </Select>
      <Select
        label={tx("Minimum meals")}
        value={filters.minMeals}
        onChange={(event) =>
          updateFilter("minMeals", Number(event.target.value))
        }
      >
        <option value="0">{tx("Any quantity")}</option>
        {[20, 40, 60, 100].map((value) => (
          <option key={value} value={value}>
            {tx("At least {0} meals", number(value))}
          </option>
        ))}
      </Select>
      <Select
        label={tx("Priority")}
        value={filters.urgency}
        onChange={(event) =>
          updateFilter(
            "urgency",
            event.target.value as DiscoveryFilters["urgency"],
          )
        }
      >
        <option value="ALL">{tx("Any priority level")}</option>
        {Object.values(PriorityLevel).map((value) => (
          <option key={value} value={value}>
            {tx(PRIORITY_META[value].label)}
          </option>
        ))}
      </Select>
      <Select
        label={tx("Storage condition")}
        value={filters.storage}
        onChange={(event) =>
          updateFilter(
            "storage",
            event.target.value as DiscoveryFilters["storage"],
          )
        }
      >
        <option value="ALL">{tx("Any storage condition")}</option>
        {Object.values(StorageCondition).map((value) => (
          <option key={value} value={value}>
            {tx(STORAGE_CONDITION_LABELS[value])}
          </option>
        ))}
      </Select>
      <Select
        label={tx("Pickup deadline")}
        value={filters.deadlineHours}
        onChange={(event) =>
          updateFilter("deadlineHours", Number(event.target.value))
        }
      >
        <option value="0">{tx("Any open deadline")}</option>
        {[2, 4, 8, 24].map((value) => (
          <option key={value} value={value}>
            {tx("Within {0} hours", number(value))}
          </option>
        ))}
      </Select>
      <Button variant="outline" onClick={resetFilters}>
        {tx("Reset filters")}
      </Button>
    </div>
  );
}
