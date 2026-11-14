"use client";

import Link from "next/link";
import { ArrowRight, Building2, ChartNoAxesCombined, MapPin } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import styles from "./ngo-dashboard.module.css";

export function NGOQuickActions() {
  const tx = useUiText();
  const actions = [
    {label:"Food collection map",description:"Explore the posted pickup areas.",href:ROUTES.ngo.discoverMap,icon:MapPin},
    {label:"Distribution records",description:"Review recorded meals and people served.",href:ROUTES.ngo.impact,icon:ChartNoAxesCombined},
    {label:"Saved delivery addresses",description:"Manage your NGO's locations and map pins.",href:ROUTES.ngo.addresses,icon:Building2},
  ];
  return <nav className={styles.linksCard} aria-label={tx("Useful NGO links")}><h2>{tx("Useful NGO links")}</h2>{actions.map(({label,description,href,icon:Icon})=><Link key={href} href={href}><Icon size={19} aria-hidden="true" /><span><strong>{tx(label)}</strong><small>{tx(description)}</small></span><ArrowRight size={15} aria-hidden="true" /></Link>)}</nav>;
}
