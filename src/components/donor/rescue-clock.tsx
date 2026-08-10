"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getRescueTimeRemaining } from "@/lib/selectors/donation-selectors";
import { cn } from "@/lib/utils";

function twoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

export function RescueClock({ deadline, compact = false }: { deadline: string; compact?: boolean }) {
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

  return (
    <div className={cn("rounded-3xl border p-4", remaining?.isExpired ? "border-muted-400/30 bg-canvas" : "border-danger/15 bg-danger-soft", compact ? "min-w-40" : "sm:min-w-48")}>
      <div className={cn("flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]", remaining?.isExpired ? "text-muted-600" : "text-danger-strong")}>
        <Clock3 className="size-4" aria-hidden="true" /> Safe pickup
      </div>
      <p role="timer" aria-live="off" aria-label={remaining?.label ?? "Loading rescue time"} className={cn("mt-2 font-black tabular-nums tracking-tight", compact ? "text-2xl" : "text-3xl sm:text-4xl", remaining?.isExpired ? "text-muted-600" : "text-danger")}>
        {now === undefined ? "--:--:--" : remaining?.isExpired ? "Closed" : `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`}
      </p>
      <p className="mt-1 text-xs text-muted-600">{remaining?.isExpired ? "The listed rescue window has ended." : "Deadline, not a freshness guarantee."}</p>
    </div>
  );
}
