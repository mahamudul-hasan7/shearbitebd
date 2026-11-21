"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import type { Claim } from "@/types/domain";
import styles from "@/components/rescue/rescue-coordination.module.css";
export function ClaimActionPanel({
  claim,
  busy,
  onRelease,
}: {
  claim: Claim;
  busy: boolean;
  onRelease: () => void;
}) {
  const tx = useUiText();
  return (
    <section className={styles.panel}>
      <div className={styles.panelBody}>
        <div className={styles.contactActions}>
          <ButtonLink href={ROUTES.ngo.reportIssue(claim.id)} variant="outline">
            {tx("Report an issue / history")}
          </ButtonLink>
        </div>
        {["RESERVED", "ASSIGNED"].includes(claim.status) && (
          <details className={styles.release}>
            <summary className="min-h-11 cursor-pointer text-sm font-semibold">
              {tx("Release this reservation")}
            </summary>
            <p className="my-3 text-sm text-muted-600">
              {tx(
                "Releasing closes this claim and lets another NGO reserve food while its collection window remains open.",
              )}
            </p>
            <Button disabled={busy} variant="outline" onClick={onRelease}>
              {tx("Release claim")}
            </Button>
          </details>
        )}
      </div>
    </section>
  );
}
