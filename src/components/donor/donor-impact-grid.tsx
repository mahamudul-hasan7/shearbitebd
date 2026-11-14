"use client";
import { getUiLocale } from "@/lib/i18n/locale";
import { useUiText } from "@/lib/i18n/use-ui-text";
import type { DonorDashboardData } from "@/features/donor-dashboard/types";
import styles from "./donor-mobile.module.css";
import { HandHeart, Package, UsersRound } from "lucide-react";
import { LiveIcon, LiveIconGroup } from "@/components/motion/live-icon";
export function DonorImpactGrid({ stats }: { stats: DonorDashboardData["stats"] }) {
  const tx = useUiText();
  const items = [
    { label: "Meals distributed", value: stats.mealsRescued, icon:HandHeart },
    { label: "Donations published", value: stats.totalDonations, icon:Package },
    { label: "NGOs supported", value: stats.ngosHelped, icon:UsersRound },
  ];
  return <LiveIconGroup className={styles.stats} data-testid="donor-impact">{items.map((item) => <div className={styles.stat} key={item.label}>
    <LiveIcon icon={item.icon} motion="ambient" className={styles.statIcon} /><strong>{item.value.toLocaleString(getUiLocale())}</strong><span>{tx(item.label)}</span>
  </div>)}</LiveIconGroup>;
}
