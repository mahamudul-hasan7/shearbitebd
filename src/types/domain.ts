import type {
  DietaryType,
  FoodCategory,
  IncidentStatus,
  IncidentType,
  NotificationType,
  PriorityLevel,
  QuantityUnit,
  RequestType,
  StorageCondition,
  TransportMethod,
  VerificationStatus,
} from "@/lib/constants/domain";
import type { UserRole } from "@/lib/constants/roles";
import type { ClaimStatus, DonationStatus, RequestStatus } from "@/lib/constants/statuses";

export type EntityId = string;
export type ISODateTime = string;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  id: EntityId;
  label: string;
  division: string;
  district: string;
  city: string;
  area: string;
  addressLine: string;
  postalCode?: string;
  landmark?: string;
  coordinates?: Coordinates;
  isPrimary: boolean;
}

export interface User {
  id: EntityId;
  email: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DonorProfile {
  id: EntityId;
  userId: EntityId;
  donorType: "INDIVIDUAL" | "CAFETERIA" | "RESTAURANT" | "BAKERY" | "EVENT_ORGANIZER";
  organizationName?: string;
  addressIds: EntityId[];
  verificationStatus: VerificationStatus;
  rating?: number;
  totalDonations: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface NGOProfile {
  id: EntityId;
  userId: EntityId;
  organizationName: string;
  registrationNumber: string;
  summary: string;
  mission: string;
  vision: string;
  values: string[];
  beneficiaryTypes: string[];
  acceptedFoodCategories: FoodCategory[];
  authorizedContactUserId: EntityId;
  addressIds: EntityId[];
  serviceAreas: string[];
  capacityMealsPerDay: number;
  peopleHelped: number;
  foundedYear: number;
  publicEmail: string;
  publicPhone: string;
  galleryUrls: string[];
  verificationStatus: VerificationStatus;
  verificationDocumentName?: string;
  rating?: number;
  completedRescues: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface VolunteerProfile {
  id: EntityId;
  userId: EntityId;
  addressId: EntityId;
  serviceAreas: string[];
  transportMethod: TransportMethod;
  availability: string[];
  verificationStatus: VerificationStatus;
  identityDocumentName?: string;
  completedRescues: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FoodSafetyDeclaration {
  freshlyPrepared: boolean;
  properlyCovered: boolean;
  noVisibleSpoilage: boolean;
  storedAccordingToDeclaration: boolean;
  allergensDisclosed: boolean;
  pickupDeadlineConfirmed: boolean;
  donorAccuracyConfirmed: boolean;
  declaredByUserId: EntityId;
  declaredAt: ISODateTime;
}

export interface DonationQuantity {
  value: number;
  unit: QuantityUnit;
  estimatedMeals: number;
}

export interface PrivateContact {
  name: string;
  phone: string;
  email?: string;
}

export interface DonationPickup {
  addressId: EntityId;
  approximateArea: string;
  distanceKm?: number;
  contact: PrivateContact;
  windowStart: ISODateTime;
  windowEnd: ISODateTime;
  directions?: string;
}

export interface Donation {
  id: EntityId;
  donorProfileId: EntityId;
  preferredNgoProfileId?: EntityId;
  title: string;
  description: string;
  category: FoodCategory;
  dietaryTypes: DietaryType[];
  quantity: DonationQuantity;
  preparationTime: ISODateTime;
  safePickupDeadline: ISODateTime;
  storageCondition: StorageCondition;
  foodCondition: "FRESHLY_PREPARED" | "SAME_DAY" | "PACKAGED";
  allergens: string[];
  photoUrls: string[];
  specialInstructions?: string;
  pickup: DonationPickup;
  safetyDeclaration: FoodSafetyDeclaration;
  priority: PriorityLevel;
  status: DonationStatus;
  publishedAt?: ISODateTime;
  cancelledAt?: ISODateTime;
  cancellationReason?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DonationPickupView {
  approximateArea: string;
  distanceKm?: number;
  windowStart: ISODateTime;
  windowEnd: ISODateTime;
  sensitiveDetailsVisible: boolean;
  exactAddress?: Address;
  contact?: PrivateContact;
  directions?: string;
}

export type DonationView = Omit<Donation, "pickup"> & { pickup: DonationPickupView };

export interface Claim {
  id: EntityId;
  donationId: EntityId;
  ngoProfileId: EntityId;
  volunteerProfileId?: EntityId;
  status: ClaimStatus;
  matchScore: number;
  reservedAt: ISODateTime;
  assignedAt?: ISODateTime;
  pickedUpAt?: ISODateTime;
  deliveredAt?: ISODateTime;
  distributedAt?: ISODateTime;
  estimatedPickupAt?: ISODateTime;
  estimatedDeliveryAt?: ISODateTime;
  pickupVerificationToken?: string;
  deliveryVerificationToken?: string;
  updatedAt: ISODateTime;
}

export interface FoodRequest {
  id: EntityId;
  ngoProfileId: EntityId;
  title: string;
  requestType: RequestType;
  priority: PriorityLevel;
  priorityReason?: string;
  purpose: string;
  recipientType: string;
  categories: FoodCategory[];
  dietaryTypes: DietaryType[];
  allergensOrRestrictions: string[];
  peopleToServe: number;
  mealsNeeded: number;
  neededBy: ISODateTime;
  preferredTimeSlot?: string;
  deliveryAddressId: EntityId;
  locationType: "SHELTER" | "COMMUNITY_CENTER" | "OTHER";
  notes?: string;
  status: RequestStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Notification {
  id: EntityId;
  userId: EntityId;
  type: NotificationType;
  priority: PriorityLevel;
  title: string;
  message: string;
  href?: string;
  createdAt: ISODateTime;
  readAt?: ISODateTime;
}

export type AppLanguage = "EN" | "BN";
export type TextSizePreference = "SMALL" | "MEDIUM" | "LARGE";
export type LocationPermissionState = "GRANTED" | "DENIED" | "NOT_REQUESTED";

export interface UserPreferences {
  userId: EntityId;
  pushNotifications: boolean;
  emailNotifications: boolean;
  locationPermission: LocationPermissionState;
  language: AppLanguage;
  textSize: TextSizePreference;
  updatedAt: ISODateTime;
}

export interface ImpactRecord {
  id: EntityId;
  claimId?: EntityId;
  donorProfileId?: EntityId;
  ngoProfileId?: EntityId;
  recordedAt: ISODateTime;
  mealsRescued: number;
  foodWeightKg: number;
  beneficiariesServed: number;
  estimatedCo2PreventedKg: number;
  estimatedWaterSavedLitres?: number;
  estimateMethodology: string;
}

export interface IncidentReport {
  id: EntityId;
  claimId: EntityId;
  reportedByUserId: EntityId;
  type: IncidentType;
  severity: PriorityLevel;
  description: string;
  evidenceUrls: string[];
  preferredContactMethod: "PHONE" | "EMAIL" | "IN_APP";
  status: IncidentStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface DistributionRecord {
  id: EntityId;
  claimId: EntityId;
  ngoProfileId: EntityId;
  beneficiariesServed: number;
  mealsDistributed: number;
  adultsServed?: number;
  childrenServed?: number;
  distributedAt: ISODateTime;
  addressId: EntityId;
  notes?: string;
  photoUrls: string[];
  beneficiaryConsentConfirmed: boolean;
  createdAt: ISODateTime;
}

export interface ViewerContext {
  userId?: EntityId;
  role?: UserRole;
  donorProfileId?: EntityId;
  ngoProfileId?: EntityId;
  volunteerProfileId?: EntityId;
}

export interface MockAppState {
  users: User[];
  addresses: Address[];
  donorProfiles: DonorProfile[];
  ngoProfiles: NGOProfile[];
  volunteerProfiles: VolunteerProfile[];
  donations: Donation[];
  claims: Claim[];
  requests: FoodRequest[];
  notifications: Notification[];
  userPreferences: UserPreferences[];
  impactRecords: ImpactRecord[];
  incidentReports: IncidentReport[];
  distributionRecords: DistributionRecord[];
}
