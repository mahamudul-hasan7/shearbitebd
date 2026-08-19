import { BookmarkCheck, PackageCheck, Truck, UsersRound, UserRoundCheck } from "lucide-react";
import { ClaimStatus, STATUS_META } from "@/lib/constants/statuses";
import { claimProgressMessage, formatClaimDateTime, isClaimStepComplete } from "@/features/claims/claim-presentation";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { Claim } from "@/types/domain";

const STEP_META = {
  [ClaimStatus.RESERVED]: { icon: BookmarkCheck, timestamp: "reservedAt" },
  [ClaimStatus.ASSIGNED]: { icon: UserRoundCheck, timestamp: "assignedAt" },
  [ClaimStatus.PICKED_UP]: { icon: Truck, timestamp: "pickedUpAt" },
  [ClaimStatus.DELIVERED]: { icon: PackageCheck, timestamp: "deliveredAt" },
  [ClaimStatus.DISTRIBUTED]: { icon: UsersRound, timestamp: "distributedAt" },
} as const;

const CLAIM_STEPS = [ClaimStatus.RESERVED, ClaimStatus.ASSIGNED, ClaimStatus.PICKED_UP, ClaimStatus.DELIVERED, ClaimStatus.DISTRIBUTED] as const;

export function ClaimStatusTimeline({ claim }: { claim: Claim }) {
  const exception = [ClaimStatus.CANCELLED, ClaimStatus.EXPIRED, ClaimStatus.DISPUTED].includes(claim.status);
  return (
    <div className="grid gap-4">
      <ol aria-label="Claim progress" className="grid gap-3 sm:grid-cols-5">
        {CLAIM_STEPS.map((step, index) => {
          const meta = STEP_META[step];
          const Icon = meta.icon;
          const complete = isClaimStepComplete(claim.status, step);
          const current = claim.status === step;
          const timestamp = claim[meta.timestamp];
          return (
            <li key={step} className="relative">
              {index > 0 && <span aria-hidden="true" className={cn("absolute right-1/2 top-6 hidden h-0.5 w-full sm:block", complete ? "bg-brand-500" : "bg-line")} />}
              <div className="relative z-10 grid h-full justify-items-center rounded-2xl border border-line bg-white p-3 text-center">
                <span className={cn("grid size-11 place-items-center rounded-full border", complete ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-canvas text-muted-400", current ? "ring-4 ring-brand-100" : undefined)}><Icon className="size-5" /></span>
                <p className={cn("mt-2 text-sm font-black", complete ? "text-brand-800" : "text-muted-500")}>{STATUS_META[step].label}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-500">{formatClaimDateTime(timestamp)}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <Alert tone={exception ? claim.status === ClaimStatus.DISPUTED ? "danger" : "warning" : "info"} title={STATUS_META[claim.status].label} description={claimProgressMessage(claim)} />
    </div>
  );
}
