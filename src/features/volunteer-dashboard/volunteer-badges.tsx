"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
export function VolunteerBadges() {
  const tx = useUiText();
  const { profile } = useVolunteerStore();
  return <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{tx("Recorded volunteer contributions")}</h3><p className="text-sm">{profile.completedMissions} {" "}{tx("verified delivery handovers")}</p><p className="text-sm">{profile.totalRescuedMeals} {" "}{tx("meals recorded as distributed by the receiving NGOs")}</p><p className="text-xs text-muted-600">{tx("Rankings, training certificates and university credits are not connected.")}</p></div>;
}
