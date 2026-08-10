import { AlertTriangle, Check } from "lucide-react";
import { DONATION_LIFECYCLE, DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

const exceptionStatuses = new Set<DonationStatus>([
  DonationStatus.CANCELLED,
  DonationStatus.EXPIRED,
  DonationStatus.DISPUTED,
]);

export function DonationStatusTimeline({ status, compact = false }: { status: DonationStatus; compact?: boolean }) {
  const currentIndex = DONATION_LIFECYCLE.indexOf(status);
  const isException = exceptionStatuses.has(status);

  return (
    <div>
      {isException && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger-strong">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p><span className="font-black">{STATUS_META[status].label}:</span> normal lifecycle progression is paused or closed.</p>
        </div>
      )}
      <ol className={cn("grid gap-2", compact ? "grid-cols-4 xl:grid-cols-8" : "grid-cols-2 sm:grid-cols-4 xl:grid-cols-8")} aria-label="Donation lifecycle">
        {DONATION_LIFECYCLE.map((item, index) => {
          const complete = currentIndex >= 0 && index < currentIndex;
          const current = item === status;
          return (
            <li key={item} aria-current={current ? "step" : undefined} className={cn("min-w-0 rounded-2xl border p-3", current ? "border-brand-500 bg-brand-50" : complete ? "border-success/20 bg-success-soft" : "border-line bg-canvas")}>
              <span className={cn("grid size-7 place-items-center rounded-full text-xs font-black", current ? "bg-brand-600 text-white" : complete ? "bg-success text-white" : "bg-white text-muted-600 ring-1 ring-line")}>
                {complete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="mt-2 block truncate text-xs font-bold text-ink-700">{STATUS_META[item].label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
