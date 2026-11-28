"use client";
import { Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { rescueNextStep } from "@/lib/rescue-next-step";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import type { VolunteerMission } from "./volunteer-types";
import styles from "./rider-mobile.module.css";

export function RiderMissionFocus({ mission, stale, expired, onDismiss }: { mission?: VolunteerMission | null; stale: boolean; expired: boolean; onDismiss: () => void }) {
  const tx = useUiText();
  if (!mission) return null;
  const model = rescueNextStep({ role: "volunteer", status: mission.claimStatus || "ASSIGNED", routeStage: mission.currentStage, expired });
  return <Card id="active-mission" data-testid="rider-mission-focus" className={styles.focus}>
    <span className="text-xs font-semibold text-[var(--role-ink)]">{tx(model.title)}</span>
    <h2 title={mission.foodTitle}>{mission.foodTitle}</h2>
    <p className={styles.route}>{mission.donorName} → {mission.ngoName}</p>
    {stale && <p role="status">{tx("Updates are paused. Refresh before continuing.")}</p>}
    <ButtonLink href={mission.currentStage === "completed" ? ROUTES.volunteer.history : ROUTES.volunteer.mission(mission.id)} leftIcon={<Navigation size={16} />}>
      {tx(mission.currentStage === "completed" ? "View mission history" : "Continue mission")}
    </ButtonLink>
    {mission.currentStage === "completed" && <Button type="button" variant="outline" onClick={onDismiss} className="mt-2 w-full">{tx("সম্পন্ন কার্ড লুকান")}</Button>}
  </Card>;
}
