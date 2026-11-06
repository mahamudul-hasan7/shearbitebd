import { ClaimStatus, CLAIM_LIFECYCLE } from "@/lib/constants/statuses";
import type { Address, Claim } from "@/types/domain";

export function formatClaimDateTime(value?: string) {
  if (!value) return "Pending";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(timestamp)
    : "Pending";
}

export function formatClaimDateTimeBn(value?: string) {
  if (!value) return "অপেক্ষমাণ";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "অপেক্ষমাণ";
  try {
    return new Intl.DateTimeFormat("bn-BD", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(timestamp);
  } catch {
    return formatClaimDateTime(value);
  }
}

export function formatAddress(address?: Address) {
  if (!address) return "ঠিকানা উন্মুক্ত নয়";
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

export function claimEtaLabelBn(claim: Claim) {
  const target = claim.status === ClaimStatus.PICKED_UP ? claim.estimatedDeliveryAt : claim.estimatedPickupAt;
  if (!target) return "শিডিউল নির্ধারিত হয়নি";
  const minutes = Math.ceil((Date.parse(target) - Date.now()) / 60_000);
  if (minutes <= 0) return "এখনই পৌঁছানোর কথা";
  if (minutes < 60) return `${minutes} মিনিট বাকি`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} ঘণ্টা${remainder ? ` ${remainder} মিনিট` : ""} বাকি`;
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

export function claimProgressMessageBn(claim: Claim) {
  const messages: Record<ClaimStatus, string> = {
    [ClaimStatus.RESERVED]: "খাদ্য লট সংরক্ষিত হয়েছে। ভেরিফায়েড ভলান্টিয়ার বরাদ্দের অপেক্ষায় রয়েছে।",
    [ClaimStatus.ASSIGNED]: "ভেরিফায়েড ভলান্টিয়ার নির্ধারিত হয়েছে এবং পিকআপের উদ্দেশ্যে প্রস্তুত।",
    [ClaimStatus.PICKED_UP]: "খাবার সংগ্রহ সম্পন্ন। রাইডার এনজিও কেন্দ্রের পথে রওনা হয়েছে।",
    [ClaimStatus.DELIVERED]: "খাবার এনজিও কেন্দ্রে সফলভাবে পৌঁছেছে। এখন বিতরণ রিপোর্ট প্রস্তুত করুন।",
    [ClaimStatus.DISTRIBUTED]: "বিতরণ সফলভাবে সম্পন্ন হয়েছে এবং জাতীয় ইমপ্যাক্ট রেকর্ডে অন্তর্ভুক্ত।",
    [ClaimStatus.CANCELLED]: "এই ক্লেইমটি বাতিল করা হয়েছে।",
    [ClaimStatus.EXPIRED]: "নির্ধারিত পিকআপের সময়সীমা শেষ হয়ে গেছে।",
    [ClaimStatus.DISPUTED]: "সমস্যা পর্যালোচনার কারণে রেসকিউ সাময়িকভাবে স্থগিত রয়েছে।",
  };
  return messages[claim.status];
}

export function claimStatusLabelBn(status: ClaimStatus) {
  const map: Record<ClaimStatus, string> = {
    [ClaimStatus.RESERVED]: "সংরক্ষিত",
    [ClaimStatus.ASSIGNED]: "ভলান্টিয়ার নির্ধারিত",
    [ClaimStatus.PICKED_UP]: "সংগ্রহ সম্পন্ন (ট্রানজিটে)",
    [ClaimStatus.DELIVERED]: "ডেলিভারি প্রাপ্ত (শেল্টারে)",
    [ClaimStatus.DISTRIBUTED]: "বিতরণ সম্পন্ন",
    [ClaimStatus.CANCELLED]: "বাতিলকৃত",
    [ClaimStatus.EXPIRED]: "মেয়াদোত্তীর্ণ",
    [ClaimStatus.DISPUTED]: "বিরোধ পর্যালোচনায়",
  };
  return map[status] || status;
}
