import { ClaimStatus, CLAIM_LIFECYCLE } from "@/lib/constants/statuses";
import type { Address, Claim } from "@/types/domain";

export function formatClaimDateTime(value?: string) {
  if (!value) return "Pending";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(timestamp)
    : "Pending";
}

export function formatAddress(address?: Address) {
  if (!address) return "Location unavailable";
  return [address.addressLine, address.area, address.city, address.postalCode].filter(Boolean).join(", ");
}

export function claimLifecycleIndex(status: ClaimStatus) {
  return CLAIM_LIFECYCLE.indexOf(status);
}

export function isClaimStepComplete(status: ClaimStatus, step: ClaimStatus) {
  const currentIndex = claimLifecycleIndex(status);
  const stepIndex = claimLifecycleIndex(step);
  return currentIndex >= stepIndex && currentIndex !== -1;
}

export function fallbackVerificationCode(token?: string) {
  if (!token) return "------";
  const digits = token.replace(/\D/g, "").slice(-6);
  return digits.padStart(6, "0");
}

export function claimEtaLabel(claim: Claim) {
  const target = claim.status === ClaimStatus.PICKED_UP ? claim.estimatedDeliveryAt : claim.estimatedPickupAt;
  if (!target) return "Awaiting schedule";
  const minutes = Math.ceil((Date.parse(target) - Date.now()) / 60_000);
  if (minutes <= 0) return "Due now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} hr${hours === 1 ? "" : "s"}${remainder ? ` ${remainder} min` : ""}`;
}

export function claimProgressMessage(claim: Claim) {
  const messages: Record<ClaimStatus, string> = {
    [ClaimStatus.RESERVED]: "Donation reserved. Waiting for a verified volunteer assignment.",
    [ClaimStatus.ASSIGNED]: "A verified volunteer is assigned and preparing for pickup.",
    [ClaimStatus.PICKED_UP]: "Food was picked up and is travelling to your NGO.",
    [ClaimStatus.DELIVERED]: "Delivery received. A distribution record is the next step.",
    [ClaimStatus.DISTRIBUTED]: "Distribution is complete and included in mock impact records.",
    [ClaimStatus.CANCELLED]: "This claim was released and is no longer active.",
    [ClaimStatus.EXPIRED]: "The rescue window expired before completion.",
    [ClaimStatus.DISPUTED]: "Normal progression is paused while the reported issue is reviewed.",
  };
  return messages[claim.status];
}
