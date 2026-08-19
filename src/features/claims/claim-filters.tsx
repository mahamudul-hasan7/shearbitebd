import { ClaimStatus } from "@/lib/constants/statuses";
import { SearchInput } from "@/components/ui/search-input";
import { CLAIM_FILTERS, type ClaimFilter } from "@/features/claims/types";
import { cn } from "@/lib/utils";
import type { ClaimCoordinationDetails } from "@/services";

export function ClaimFilters({
  items,
  filter,
  search,
  onFilterChange,
  onSearchChange,
}: {
  items: ClaimCoordinationDetails[];
  filter: ClaimFilter;
  search: string;
  onFilterChange: (filter: ClaimFilter) => void;
  onSearchChange: (search: string) => void;
}) {
  function countFor(value: ClaimFilter) {
    return value === "ALL" ? items.length : items.filter((item) => item.claim.status === value).length;
  }

  return (
    <div className="grid gap-4">
      <SearchInput
        label="Search claims"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by food, donor, area, volunteer, or claim ID"
      />
      <div role="group" aria-label="Filter claims by status" className="flex gap-2 overflow-x-auto pb-1">
        {CLAIM_FILTERS.map((item) => {
          const active = filter === item.value;
          const isException = item.value === ClaimStatus.EXPIRED;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(item.value)}
              className={cn(
                "inline-flex min-w-max items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
                active ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-muted-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800",
                active && isException ? "border-danger bg-danger" : undefined,
              )}
            >
              {item.label}
              <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-canvas text-muted-600")}>{countFor(item.value)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
