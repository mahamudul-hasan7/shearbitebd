"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";

import { CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { DonationStatus } from "@/lib/constants/statuses";
import { getRescueTimeRemaining } from "@/lib/selectors/donation-selectors";
import { cn } from "@/lib/utils";

function twoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

const PICKUP_PENDING = new Set<DonationStatus>([
  DonationStatus.PUBLISHED, DonationStatus.AVAILABLE, DonationStatus.RESERVED, DonationStatus.ASSIGNED,
]);
const CLOSED_COPY: Partial<Record<DonationStatus, [string, string]>> = {
  DISTRIBUTED: ["Distribution complete", "The NGO has completed distribution. This rescue countdown has stopped."],
  PICKED_UP: ["Pickup complete", "The rider has collected this food. Follow the saved delivery checkpoints."],
  DELIVERED: ["Delivered to NGO", "The food has reached the NGO. Distribution is still pending."],
  CANCELLED: ["Donation cancelled", "This rescue is closed. The countdown has stopped."],
  EXPIRED: ["Pickup time ended", "The declared pickup deadline has passed."],
  DISPUTED: ["Rescue under review", "Follow the saved status while the incident is reviewed."],
  DRAFT: ["Draft donation", "The countdown starts after this donation is published."],
};

export function RescueClock({ deadline, compact = false, status }: { deadline: string; compact?: boolean; status?: DonationStatus }) {
  const tx = useUiText();
  if (!status || PICKUP_PENDING.has(status)) return <PickupCountdown deadline={deadline} compact={compact} />;
  const [title, description] = CLOSED_COPY[status] ?? [status, "This rescue is closed. The countdown has stopped."];
  const completed = [DonationStatus.PICKED_UP, DonationStatus.DELIVERED, DonationStatus.DISTRIBUTED].includes(status);
  const Icon = completed ? CheckCircle2 : Clock3;
  return <div data-testid="rescue-clock" data-state={status} className={cn("grid gap-2 rounded-2xl border p-4", completed ? "border-success/20 bg-success-soft text-success-strong" : "border-line bg-canvas text-muted-600")}>
    <p className="flex items-center gap-2 text-sm font-bold"><Icon className="size-4 shrink-0" aria-hidden="true" />{tx(title)}</p>
    <p className="text-xs leading-5">{tx(description)}</p>
  </div>;
}

function PickupCountdown({ deadline, compact }: { deadline: string; compact: boolean }) {
  const tx = useUiText();
  const [now, setNow] = useState<number>();

  useEffect(() => {
    const updateClock = () => setNow(Date.now());
    const initialTimer = window.setTimeout(updateClock, 0);
    const interval = window.setInterval(updateClock, 1_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  const remaining = now === undefined ? undefined : getRescueTimeRemaining(deadline, now);
  const totalSeconds = Math.floor((remaining?.milliseconds ?? 0) / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (compact) return <div data-testid="rescue-clock" data-state="counting" className="grid min-w-0 gap-1.5">
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <Clock3 className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
      <span>{tx("Pickup time left")}</span>
      <span role="timer" aria-live="off" aria-label={remaining?.label ?? tx("Loading rescue time")}
        className={cn("ml-auto font-semibold tabular-nums", remaining?.isExpired ? "text-slate-500" : totalSeconds <= 2700 && now !== undefined ? "text-amber-700" : "text-emerald-800")}>
        {now === undefined ? "--:--:--" : remaining?.isExpired ? tx("সময় শেষ") : `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`}
      </span>
    </div>
    <p className="text-xs leading-5 text-slate-500">{remaining?.isExpired ? tx("নির্ধারিত পিকআপের সময়সীমা উত্তীর্ণ হয়েছে।") : tx("এই সময়ের মধ্যে ভলান্টিয়ার খাবার সংগ্রহ করবেন।")}</p>
  </div>;

  return (
    <div data-testid="rescue-clock" data-state="counting" className={cn("rounded-3xl border p-4", remaining?.isExpired ? "border-muted-400/30 bg-canvas" : "border-danger/15 bg-danger-soft", compact ? "min-w-40" : "sm:min-w-48")}>
      <div className={cn("flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]", remaining?.isExpired ? "text-muted-600" : "text-danger-strong")}>
        <Clock3 className="size-4" aria-hidden="true" /> {tx("নিরাপদ পিকআপ সময়সীমা")}</div>
      <p role="timer" aria-live="off" aria-label={remaining?.label ?? "Loading rescue time"} className={cn("mt-2 font-black tabular-nums tracking-tight font-mono", compact ? "text-2xl" : "text-3xl sm:text-4xl", remaining?.isExpired ? "text-muted-600" : "text-danger")}>
        {now === undefined ? "--:--:--" : remaining?.isExpired ? tx("সময় শেষ") : `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`}
      </p>
      <p className="mt-1 text-xs text-muted-600">{remaining?.isExpired ? tx("নির্ধারিত পিকআপের সময়সীমা উত্তীর্ণ হয়েছে।") : tx("এই সময়ের মধ্যে ভলান্টিয়ার খাবার সংগ্রহ করবেন।")}</p>
    </div>
  );
}
