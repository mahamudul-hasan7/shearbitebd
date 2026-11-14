"use client";

import Link from "next/link";
import { ArrowRight, Clock3, MapPin, PackageCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/lib/routes";
import type { NGOActiveClaim } from "./types";
import { claimNextStep } from "./dashboard-presentation";
import styles from "./ngo-dashboard.module.css";

export function ActiveClaimOverview({items}:{items:NGOActiveClaim[]}) {
  const tx = useUiText();
  const {language} = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  return <section aria-labelledby="ngo-active-title" data-testid="ngo-active-work"><div className={styles.sectionHeading}><h2 id="ngo-active-title">{tx("Your active rescues")}<span className={styles.count}>{items.length.toLocaleString(locale)}</span></h2><Link className={styles.allLink} href={ROUTES.ngo.claims}>{tx("View all")}<ArrowRight size={16} aria-hidden="true" /></Link></div>
    {items.length === 0 ? <div className={styles.noActive}><PackageCheck size={25} aria-hidden="true" /><div><h3>{tx("No active claims")}</h3><p>{tx("Browse food posts to start your next collection.")}</p></div></div> : <div className={styles.activeGrid}>{items.slice(0,3).map(({claim,donation})=>{
      const next = claimNextStep(claim.status);
      const expected = claim.estimatedPickupAt && ["RESERVED","ASSIGNED"].includes(claim.status) ? new Date(claim.estimatedPickupAt) : undefined;
      return <article className={styles.activeCard} data-claim-id={claim.id} data-status={claim.status} key={claim.id}>
        <div className={styles.claimTop}><StatusBadge status={claim.status} /></div><h3>{donation.title}</h3><p className={styles.area}><MapPin size={14} aria-hidden="true" />{donation.pickup.approximateArea}</p><p className={styles.nextStep}>{tx(next.description)}</p>
        {expected && Number.isFinite(expected.getTime()) && <p className={styles.pickupTime}><Clock3 size={14} aria-hidden="true" />{tx("Expected pickup: {0}",new Intl.DateTimeFormat(locale,{timeZone:"Asia/Dhaka",hour:"numeric",minute:"2-digit"}).format(expected))}</p>}
        <Link href={ROUTES.ngo.claim(claim.id)} className={styles.workAction}>{tx(next.label)}<ArrowRight size={16} aria-hidden="true" /></Link>
      </article>;
    })}</div>}
  </section>;
}
