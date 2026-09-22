import { AlertTriangle, Bell, HandHeart, MapPin, PackageCheck, Truck, UsersRound, type LucideIcon } from "lucide-react";
import { NotificationType, PriorityLevel } from "@/lib/constants/domain";
import type { BadgeTone } from "@/components/ui/badge";

export const NGO_NOTIFICATION_META: Record<NotificationType, { label: string; icon: LucideIcon }> = {
  [NotificationType.URGENT]: { label: "Urgent", icon: AlertTriangle },
  [NotificationType.CLAIM]: { label: "Claim", icon: HandHeart },
  [NotificationType.VOLUNTEER]: { label: "Volunteer", icon: UsersRound },
  [NotificationType.PICKUP]: { label: "Pickup", icon: Truck },
  [NotificationType.DELIVERY]: { label: "Delivery", icon: PackageCheck },
  [NotificationType.NEARBY_DONATION]: { label: "Nearby food", icon: MapPin },
  [NotificationType.IMPACT]: { label: "Impact", icon: HandHeart },
  [NotificationType.SYSTEM]: { label: "System", icon: Bell },
};

export function notificationPriorityTone(priority: PriorityLevel): BadgeTone {
  if (priority === PriorityLevel.URGENT) return "danger";
  if (priority === PriorityLevel.HIGH) return "warning";
  if (priority === PriorityLevel.MEDIUM) return "info";
  return "neutral";
}
