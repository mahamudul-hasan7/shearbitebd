import type { LucideIcon } from "lucide-react";

export type PortalRole = "donor" | "ngo";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  isPrimary?: boolean;
};
