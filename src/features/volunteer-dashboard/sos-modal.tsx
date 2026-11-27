"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";
import { ROUTES } from "@/lib/routes";

interface Props { isOpen: boolean; onClose: () => void; onSubmitReport: (reason: string, delayMins: number) => void; }
export function SosModal({ isOpen, onClose }: Props) {
  const tx = useUiText();
  const { activeMission } = useVolunteerStore();
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 backdrop-blur-sm p-4"><section role="dialog" aria-modal="true" aria-label={tx("Rescue issue reporting")} className="liquid-glass-card grid max-w-lg gap-4 rounded-2xl border border-white/80 bg-white/82 p-6 shadow-2xl backdrop-blur-2xl"><h2 className="text-xl font-bold">{tx("Report a rescue issue")}</h2><p className="text-sm">{tx("SOS/radio dispatch is not connected. This app does not contact emergency responders. For a mission issue, open the incident form to save a report and supporting photos for operator review.")}</p>{activeMission ? <ButtonLink href={ROUTES.volunteer.reportIssue(activeMission.id)}>{tx("Open mission issue report")}</ButtonLink> : <p className="text-sm text-muted-600">{tx("No active mission is assigned to this account.")}</p>}<Button variant="outline" onClick={onClose}>{tx("Close")}</Button></section></div>;
}
