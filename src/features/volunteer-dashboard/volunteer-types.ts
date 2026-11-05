export type MissionStage =
  | "assigned"
  | "en_route_pickup"
  | "at_pickup"
  | "cargo_loaded"
  | "en_route_dropoff"
  | "completed";

export type DutyStatus = "online" | "offline";

export interface AvailableDispatch {
  id: string;
  donorName: string;
  donorArea: string;
  donorPhone: string;
  donorContact: string;
  ngoName: string;
  ngoArea: string;
  ngoPhone: string;
  ngoContact: string;
  foodType: string;
  quantity: string;
  servings: number;
  expiresInMins: number;
  urgency: "critical" | "high" | "normal";
  distanceKm: number;
  storageCondition: string;
  dietary: string;
  specialNote?: string;
}

export interface VolunteerMission {
  id: string;
  donorName: string;
  donorAddress: string;
  donorArea: string;
  donorPhone: string;
  donorContact: string;
  ngoName: string;
  ngoAddress: string;
  ngoArea: string;
  ngoPhone: string;
  ngoContact: string;
  foodTitle: string;
  quantity: string;
  servings: number;
  storageCondition: string;
  safeDeadline: string;
  distanceKm: number;
  estimatedTimeMins: number;
  currentStage: MissionStage;
  pickupOtp: string;
  dropoffOtp: string;
  cargoTemp: number; // °C
  riderSpeed: number; // km/h
  urgency: "critical" | "high" | "normal";
  assignedAt: string;
  routeStops: {
    pickup: string;
    expressway: string;
    dropoff: string;
  };
}

export interface VolunteerSquadProfile {
  id: string;
  fullName: string;
  role: string;
  squadRank: string;
  squadBadge: string;
  avatarInitials: string;
  bloodGroup: string;
  phone: string;
  emergencyContact: string;
  universityAffiliation: string;
  vehicleType: string;
  vehicleRegNo: string;
  bfsaCertificationId: string;
  rating: number;
  reviewsCount: number;
  totalRescuedMeals: number;
  completedMissions: number;
  onTimeRate: number;
  joinedDate: string;
}

export interface CompletedMissionRecord {
  id: string;
  missionNumber: string;
  date: string;
  time: string;
  donorName: string;
  donorArea: string;
  ngoName: string;
  ngoArea: string;
  foodTitle: string;
  quantity: string;
  servings: number;
  distanceKm: number;
  durationMins: number;
  deliverySpeedNote: string;
  cargoTempHandover: number;
  foodValueSavedEstimated: number;
  verificationToken: string;
  status: "delivered_verified" | "disputed" | "late_handled";
  ngoRating: number;
  ngoFeedback: string;
}

