"use client";

import { useId } from "react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useVolunteerStore } from "./volunteer-store";
import { cn } from "@/lib/utils";
import { Bike } from "lucide-react";
import { LiveIcon } from "@/components/motion/live-icon";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function VolunteerDutyPanel() {
  const tx = useUiText();
  const labelId = useId(), descriptionId = useId();
  const { dutyStatus, dutyReady, dutySaving, dutyError, dutyHasActiveMission: busy, canGoOnDuty, setDutyStatus, refreshDuty } = useVolunteerStore();
  const on = dutyStatus === "online";
  return <section aria-label={tx("Duty status")} data-testid="volunteer-duty-panel" className="mb-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 id={labelId} className="flex items-center gap-2 text-sm font-bold text-slate-900"><LiveIcon key={`${on}-${dutyReady}`} icon={Bike} motion={dutyReady && on && !dutySaving ? "once" : "still"} size={25} className={on && dutyReady ? "text-emerald-700" : "text-slate-500"} />{tx("Duty ON/OFF")}</h2>
        <p className={cn("mt-1 flex flex-wrap items-center gap-2 text-sm font-bold", on && dutyReady ? "text-emerald-800" : "text-slate-600")}>
          <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", on && dutyReady ? "bg-emerald-600" : "bg-slate-400")} />
          {!dutyReady ? tx("Checking duty status…") : on ? tx("Duty ON") : tx("Duty OFF")}
          {busy && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">{tx("Mission in progress")}</span>}
        </p>
      </div>
      <button type="button" role="switch" aria-labelledby={labelId} aria-describedby={descriptionId} aria-checked={dutyReady && on} aria-busy={dutySaving || !dutyReady}
        disabled={!dutyReady || dutySaving || (!canGoOnDuty && !on)} onClick={() => void setDutyStatus(on ? "offline" : "online")}
        className="grid h-11 w-16 shrink-0 place-items-center rounded-xl outline-offset-4 disabled:cursor-wait disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
        <span aria-hidden="true" className={cn("relative block h-7 w-12 rounded-full motion-safe:transition-colors motion-safe:duration-200", on && dutyReady ? "bg-emerald-600" : "bg-slate-400")}>
          <span className={cn("absolute left-1 top-1 size-5 rounded-full bg-white shadow-sm motion-safe:transition-transform", on && dutyReady ? "translate-x-5" : "translate-x-0")} />
        </span>
      </button>
    </div>
    <p id={descriptionId} className="mt-3 text-xs leading-5 text-slate-600">{tx("ON lets you accept new missions. OFF pauses new missions; you can still view the list.")}</p>
    {busy && <div className="mt-2 text-xs leading-5 text-amber-800"><p>{tx("Finish your current mission before accepting another one.")}</p><p>{tx("Turning duty OFF does not cancel your current mission. Continue it as usual.")}</p></div>}
    {dutyReady && !canGoOnDuty && <p className="mt-2 text-xs leading-5 text-amber-800">{tx("Volunteer verification is required before going on duty.")}</p>}
    {dutySaving && <LoadingSpinner label={tx("Saving duty status…")} className="mt-2" />}
    {dutyError && <div role="alert" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
      <span>{tx(dutyError)}</span><button type="button" className="min-h-11 rounded-lg px-2 font-bold underline" disabled={dutySaving} onClick={() => void refreshDuty()}>{tx("Retry")}</button>
    </div>}
  </section>;
}
