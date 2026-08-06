export enum UserRole {
  DONOR = "DONOR",
  NGO = "NGO",
  VOLUNTEER = "VOLUNTEER",
  ADMIN = "ADMIN",
}

export const USER_ROLE_META: Record<
  UserRole,
  { label: string; description: string; publicRegistration: boolean }
> = {
  [UserRole.DONOR]: {
    label: "Food Donor",
    description: "Post, coordinate, and track surplus food donations.",
    publicRegistration: true,
  },
  [UserRole.NGO]: {
    label: "NGO / Organization",
    description: "Discover, claim, receive, and distribute rescued food.",
    publicRegistration: true,
  },
  [UserRole.VOLUNTEER]: {
    label: "Volunteer",
    description: "Support verified pickup and delivery tasks.",
    publicRegistration: true,
  },
  [UserRole.ADMIN]: {
    label: "Administrator",
    description: "Moderate verification, safety, and disputes.",
    publicRegistration: false,
  },
};
