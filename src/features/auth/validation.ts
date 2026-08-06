import type { RegistrationData, RegistrationErrors, RegistrationRole } from "@/features/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BANGLADESH_PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return undefined;
}

export function validateBangladeshPhone(value: string) {
  const phone = value.replace(/[\s-]/g, "");
  if (!phone) return "Enter your phone number.";
  if (!BANGLADESH_PHONE_PATTERN.test(phone)) return "Use a valid Bangladesh mobile number.";
  return undefined;
}

export function validatePassword(value: string) {
  if (!value) return "Enter your password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
  return undefined;
}

export function validateLogin(values: { email: string; password: string }) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

export function validateRegistrationStep({
  step,
  role,
  data,
  termsAccepted,
  documentName,
}: {
  step: number;
  role: RegistrationRole;
  data: RegistrationData;
  termsAccepted: boolean;
  documentName: string;
}): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (step === 1) {
    errors.fullName = required(data.fullName, role === "ngo" ? "Enter the authorized contact name." : "Enter your full name.");
    errors.email = validateEmail(data.email);
    errors.phone = validateBangladeshPhone(data.phone);
    errors.password = validatePassword(data.password);
    errors.confirmPassword = required(data.confirmPassword, "Confirm your password.");
    if (!errors.confirmPassword && data.password !== data.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  }

  if (step === 2 && role === "donor") {
    errors.donorType = required(data.donorType, "Select a donor type.");
    errors.address = required(data.address, "Enter the primary pickup address.");
  }

  if (step === 2 && role === "ngo") {
    errors.organizationName = required(data.organizationName, "Enter the organization name.");
    errors.registrationNumber = required(data.registrationNumber, "Enter the registration or licence number.");
    errors.beneficiaryType = required(data.beneficiaryType, "Select the primary beneficiary group.");
    errors.city = required(data.city, "Enter the operating city.");
    errors.address = required(data.address, "Enter the organization address.");
    errors.notes = required(data.notes, "Describe the organization and distribution capacity.");
  }

  if (step === 2 && role === "volunteer") {
    errors.city = required(data.city, "Enter your city.");
    errors.transport = required(data.transport, "Select a transport method.");
    errors.availability = required(data.availability, "Select your general availability.");
    errors.address = required(data.address, "Enter your preferred service area.");
  }

  if (step === 3) {
    if (!termsAccepted) errors.terms = "Accept the terms, privacy policy, and truthful-use declaration.";
    if ((role === "ngo" || role === "volunteer") && !documentName) {
      errors.document = role === "ngo" ? "Add an organization verification document." : "Add an identity verification document.";
    }
  }

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message))) as RegistrationErrors;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
