export interface VolunteerDuty {
  volunteerProfileId: string;
  isOnDuty: boolean;
  startedAt: string | null;
  version: number;
  canGoOnDuty: boolean;
  hasActiveMission: boolean;
}
