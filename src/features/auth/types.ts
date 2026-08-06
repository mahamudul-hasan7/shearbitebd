import type { UserRole } from "@/lib/constants/roles";

export type RegistrationRole = "donor" | "ngo" | "volunteer";

export interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  donorType: string;
  organizationName: string;
  registrationNumber: string;
  beneficiaryType: string;
  address: string;
  city: string;
  transport: string;
  availability: string;
  notes: string;
}

export const INITIAL_REGISTRATION_DATA: RegistrationData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  donorType: "individual",
  organizationName: "",
  registrationNumber: "",
  beneficiaryType: "shelter",
  address: "",
  city: "Dhaka",
  transport: "bicycle",
  availability: "weekends",
  notes: "",
};

export type RegistrationErrorKey = keyof RegistrationData | "terms" | "document";
export type RegistrationErrors = Partial<Record<RegistrationErrorKey, string>>;

export interface MockAuthSession {
  email: string;
  displayName: string;
  role: UserRole;
  signedInAt: string;
}
