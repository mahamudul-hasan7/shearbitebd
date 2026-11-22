"use client";
import { Bike, Building2, HandHeart } from "lucide-react";
import type { PortalRole } from "@/types/navigation";
import { useUiText } from "@/lib/i18n/use-ui-text";
import styles from "./portal-theme.module.css";
const roles = {
  donor: { label: "Donor", icon: HandHeart },
  ngo: { label: "NGO", icon: Building2 },
  volunteer: { label: "Rider", icon: Bike },
};
export function RoleBadge({
  role,
  inverse = false,
}: {
  role: PortalRole;
  inverse?: boolean;
}) {
  const tx = useUiText(),
    { label, icon: Icon } = roles[role];
  return (
    <span
      className={styles.roleBadge}
      data-role-badge={role}
      data-inverse={inverse || undefined}
      aria-label={tx("{0} workspace", tx(label))}
    >
      <Icon size={15} aria-hidden="true" />
      <span>{tx(label)}</span>
    </span>
  );
}
