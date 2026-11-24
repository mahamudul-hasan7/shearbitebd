"use client";

import { useEffect, useId } from "react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useVolunteerStore } from "./volunteer-store";
import { cn } from "@/lib/utils";

export function VolunteerDutySwitch() {
  const tx = useUiText();
  const labelId = useId();
  const { dutyStatus, dutyReady, dutySaving, dutyError, canGoOnDuty, setDutyStatus, refreshDuty } = useVolunteerStore();
  useEffect(() => { void refreshDuty(); }, [refreshDuty]);
  const on = dutyReady && dutyStatus === "online";
  return (
    <section data-testid="volunteer-duty-switch" className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-semibold text-slate-900">{tx("Duty ON/OFF")}</p>
          <p role="status" className={cn("mt-1 text-xs", on ? "text-emerald-800" : "text-slate-600")}>
            {tx(dutySaving ? "Saving duty status…" : !dutyReady ? "Checking duty status…" : on ? "Duty ON" : "Duty OFF")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-labelledby={labelId}
          aria-checked={on}
          aria-busy={dutySaving || !dutyReady}
          disabled={!dutyReady || dutySaving || !canGoOnDuty}
          onClick={() => void setDutyStatus(on ? "offline" : "online")}
          className="grid h-11 w-14 shrink-0 place-items-center rounded-xl outline-offset-2 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-50"
        >
          <span aria-hidden="true" className={cn("relative block h-7 w-12 rounded-full motion-safe:transition-colors", on ? "bg-emerald-600" : "bg-slate-400")}>
            <span className={cn("absolute left-1 top-1 size-5 rounded-full bg-white shadow-sm motion-safe:transition-transform", on && "translate-x-5")} />
          </span>
        </button>
      </div>
      {dutyReady && !canGoOnDuty && <p className="mt-2 text-xs text-amber-800">{tx("Admin approval is required to use duty controls.")}</p>}
      {dutyError && <div role="alert" className="mt-2 text-xs text-red-800">
        <p>{tx(dutyError)}</p>
        <button type="button" disabled={dutySaving} className="min-h-11 font-semibold underline" onClick={() => void refreshDuty()}>{tx("Retry")}</button>
      </div>}
    </section>
  );
}
