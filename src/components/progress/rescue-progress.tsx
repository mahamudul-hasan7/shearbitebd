"use client";

import { useState, type CSSProperties } from "react";
import { Ban, Bike, Building2, Check, CircleCheck, Clock3, HandHeart, Package, PackageCheck, Pause, Play, ShieldAlert, UsersRound } from "lucide-react";
import { buildRescueProgress, type RescueProgressIcon, type RescueProgressInput } from "@/lib/rescue-progress";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { getUiLocale } from "@/lib/i18n/locale";
import styles from "./rescue-progress.module.css";
import { LiveIcon, LiveIconGroup } from "@/components/motion/live-icon";

const icons = { package: Package, claim: HandHeart, rider: Bike, pickup: PackageCheck, ngo: Building2, people: UsersRound };
const badges = { active: "In progress", complete: "Completed", paused: "Paused", cancelled: "Cancelled", expired: "Expired", draft: "Draft" };

export function RescueProgress({ label = "Rescue progress", stale = false, compact = false, ...input }: RescueProgressInput & { label?: string; stale?: boolean; compact?: boolean }) {
  const tx = useUiText();
  const [paused, setPaused] = useState(false);
  const model = buildRescueProgress(input);
  const exceptional = ["paused", "cancelled", "expired"].includes(model.state);
  const moving = model.state === "active" && !stale;
  const travelling = input.routeStage === "en_route_pickup" || input.routeStage === "en_route_dropoff";
  const Marker = exceptional ? ShieldAlert : model.state === "complete" ? CircleCheck : travelling ? Bike : icons[model.steps[model.index].icon];
  function time(value?: string) {
    if (!value || !Number.isFinite(Date.parse(value))) return undefined;
    return new Intl.DateTimeFormat(getUiLocale(), { timeZone: "Asia/Dhaka", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
  }
  return <section className={`${styles.root} ${compact ? styles.compact : ""}`} aria-label={tx(label)} data-testid="rescue-progress" data-phase={model.steps[model.index].id} data-state={model.state} data-stale={stale} data-motion={moving && !paused ? "running" : "paused"}>
    <div className={styles.heading}>
      <span className={styles.eyebrow}>{tx("Food rescue journey")}</span>
      <span className={styles.badge}><span aria-hidden="true" />{stale ? tx("Updates paused") : tx(badges[model.state])}</span>
    </div>
    <div className={styles.summary} aria-live="polite" aria-atomic="true">
      <h3>{tx(model.title)}</h3>
      <p>{tx(model.description)}</p>
      {exceptional && (
        <div className={styles.milestoneCallout} data-state={model.state}>
          <strong>{tx("Stopped at step {0} of {1}: {2}", model.index + 1, model.steps.length, tx(model.stoppedAtLabel))}</strong>
          {input.cancellationReason && <span>{tx("Reason: {0}", input.cancellationReason)}</span>}
        </div>
      )}
      {model.state === "complete" && (
        <div className={styles.milestoneCallout} data-state="complete">
          <strong>{tx("All {0} steps completed", model.steps.length)}</strong>
        </div>
      )}
    </div>
    <LiveIconGroup className={styles.scene} paused={!moving || paused} aria-hidden="true" style={{ "--journey-position": `${model.position}%` } as CSSProperties}>
      <div className={styles.track}><div className={styles.fill} /><div className={styles.flow} />
        {model.steps.map((step, i) => <span key={step.id} className={`${styles.dot} ${step.done || step.current ? styles.reached : ""}`} style={{ left: `${i / (model.steps.length - 1) * 100}%` }} />)}
        <div className={styles.marker}><LiveIcon key={`${model.steps[model.index].id}-${input.routeStage}`} icon={Marker} motion={model.state === "complete" ? "once" : moving && (Marker !== Bike || travelling) ? "ambient" : "still"} size={27} strokeWidth={1.8} /></div>
      </div>
      <div className={styles.sceneLabels}><span><Package size={13} />{tx("Donor")}</span><span><Bike size={14} />{tx("Rider")}</span><span><Building2 size={13} />{tx("NGO")}</span></div>
    </LiveIconGroup>
    <ol className={styles.steps} aria-label={tx("Confirmed rescue steps")}>
      {model.steps.map((step, i) => {
        const Icon = icons[step.icon as RescueProgressIcon];
        const stamp = time(step.timestamp);
        const stoppedHere = exceptional && step.current;
        const StepGlyph = stoppedHere
          ? model.state === "cancelled"
            ? Ban
            : model.state === "expired"
              ? Clock3
              : ShieldAlert
          : undefined;
        const statusText = stamp
          ? undefined
          : stoppedHere
            ? model.state === "cancelled"
              ? "Cancelled at this step"
              : model.state === "expired"
                ? "Expired at this step"
                : "Paused at this step"
            : step.current
              ? model.state === "complete"
                ? "Completed"
                : model.state === "draft"
                  ? "Saved as draft"
                  : "Current step"
              : step.done
                ? "Completed"
                : "Pending";
        return <li key={step.id} aria-current={step.current ? "step" : undefined} data-step={step.id} data-done={step.done} data-current={step.current} data-stopped={stoppedHere || undefined}>
          <span className={styles.stepIcon} aria-hidden="true">{StepGlyph ? <StepGlyph size={15} /> : step.done ? <LiveIcon icon={Check} motion="once" size={15} strokeWidth={2.5} /> : <Icon size={16} />}</span>
          <div><p>{tx(step.label)}</p><span className={styles.stepNote}>{stamp ? <time dateTime={step.timestamp}>{stamp}</time> : tx(statusText || "Pending")}</span></div>
          <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
        </li>;
      })}
    </ol>
    <div className={styles.footer}>
      <span>{tx("Step {0} of {1}", model.index + 1, model.steps.length)}{time(input.updatedAt) && <> · {tx("Last activity {0}", time(input.updatedAt))}</>}</span>
      {moving && <button type="button" className={styles.motionButton} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{tx(paused ? "Play animation" : "Pause animation")}</button>}
    </div>
    {stale && <p className={styles.stale} role="status">{tx("Showing the last saved progress. Refresh to reconnect.")}</p>}
  </section>;
}
