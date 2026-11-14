"use client";

import { NotificationCenterView } from "@/components/notifications/notification-center-view";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useVolunteerStore } from "@/features/volunteer-dashboard/volunteer-store";

export function VolunteerNotifications() {
  const { session } = useMockAuth();
  const { profile } = useVolunteerStore();

  const volunteerName = session?.displayName || profile.fullName;
  const initials =
    volunteerName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "VR";

  return (
    <NotificationCenterView
      role="volunteer"
      profileName={volunteerName}
      profileDescription={`${profile.squadRank} · ${profile.universityAffiliation}`}
      avatarInitials={initials}
    />
  );
}
