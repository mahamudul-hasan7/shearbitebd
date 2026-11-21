"use client";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { rescueNextStep } from "@/lib/rescue-next-step";
import styles from "./rescue-coordination.module.css";
export function RescueNextAction({
  model,
  children,
  stale = false,
}: {
  model: ReturnType<typeof rescueNextStep>;
  children?: ReactNode;
  stale?: boolean;
}) {
  const tx = useUiText();
  return (
    <section
      className={styles.next}
      data-tone={model.tone}
      data-testid="rescue-next-action"
    >
      <div className={styles.nextTop}>
        <span>
          <ArrowRight size={16} />
          {tx("Next in this rescue")}
        </span>
        <span>
          <ShieldCheck size={15} />
          {tx("Saved workflow")}
        </span>
      </div>
      <h2>{tx(model.title)}</h2>
      <p>{tx(model.description)}</p>
      {stale && (
        <p role="status">
          {tx("Updates are paused. Refresh before continuing.")}
        </p>
      )}
      {children && <div className={styles.nextActions}>{children}</div>}
    </section>
  );
}
