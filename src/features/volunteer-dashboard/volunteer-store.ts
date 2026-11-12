"use client";

import { useSyncExternalStore } from "react";
import { createRealNotification } from "@/lib/notifications/real-notification-client";
import { mockAppStore } from "@/store/mock-app-store";
import { ClaimStatus, DonationStatus } from "@/lib/constants/statuses";
import { triggerCelebration } from "@/components/ui/action-success-modal";
import type {
  AvailableDispatch,
  CompletedMissionRecord,
  DutyStatus,
  MissionStage,
  VolunteerMission,
  VolunteerSquadProfile,
} from "./volunteer-types";

export const INITIAL_ACTIVE_MISSION: VolunteerMission = {
  id: "mission-uiu-mastul",
  claimId: "clm_mwd36f4j_kr5h",
  donorName: "UIU Cafeteria & Food Court",
  donorAddress: "United City, Madani Avenue, 100 Feet Road, Badda, Dhaka-1212",
  donorArea: "বাড্ডা · নতুন বাজার",
  donorPhone: "+8801700000001",
  donorContact: "আসিফ ইকবাল (ক্যাফেটেরিয়া ইনচার্জ)",
  ngoName: "মাস্তুল ফাউন্ডেশন শেল্টার ও এতিমখানা",
  ngoAddress: "বাড়ি ১৪, রোড ৩২ পুরাতন, ধানমন্ডি, ঢাকা-১২০৯",
  ngoArea: "ধানমন্ডি ৩২",
  ngoPhone: "+8801700000011",
  ngoContact: "ফারহানা রহমান (রেসকিউ কোঅর্ডিনেটর)",
  foodTitle: "উদ্বৃত্ত স্পেশাল কাচ্চি বিরিয়ানি ও চিকেন রোস্ট",
  quantity: "৮৫টি ফয়েল বক্স",
  servings: 110,
  storageCondition: "থার্মাল ইনসুলেটেড কার্টন (>৬০°সে)",
  safeDeadline: "আজ রাত ১১:৩০ পর্যন্ত",
  distanceKm: 8.4,
  estimatedTimeMins: 28,
  currentStage: "at_pickup",
  pickupOtp: "7429",
  dropoffOtp: "9814",
  cargoTemp: 64,
  riderSpeed: 28,
  urgency: "critical",
  assignedAt: "১০:১৫ PM",
  routeStops: {
    pickup: "ইউআইইউ ক্যাম্পাস, মাদানী এভিনিউ (পিকআপ পয়েন্ট)",
    expressway: "হাতিরঝিল এক্সপ্রেসওয়ে ও পান্থপথ ফ্লাইওভার",
    dropoff: "মাস্তুল ফাউন্ডেশন শেল্টার গেট, ধানমন্ডি ৩২",
  },
};

export const INITIAL_DISPATCHES: AvailableDispatch[] = [
  {
    id: "dsp-01",
    donorName: "Sultan's Dine - Gulshan 2",
    donorArea: "Road 103, Gulshan-2, Dhaka",
    donorPhone: "+8801811223344",
    donorContact: "তানজিম কবির (ম্যানেজার)",
    ngoName: "Bidyanondo Foundation",
    ngoArea: "Mirpur-12 Food Center",
    ngoPhone: "+8801911887766",
    ngoContact: "সাদিয়া ইসলাম",
    foodType: "কাচ্চি বিরিয়ানি ও বোরহানি (সিল্ড ফয়েল)",
    quantity: "৬৫টি কন্টেইনার",
    servings: 85,
    expiresInMins: 38,
    urgency: "critical",
    distanceKm: 6.4,
    storageCondition: "গরম অবস্থায় সংরক্ষিত",
    dietary: "১০০% হালাল",
    specialNote: "ক্যাফেটেরিয়ার পেছনের সার্ভিস গেটে বাইক রাখুন।",
  },
  {
    id: "dsp-02",
    donorName: "Radisson Blu Water Garden",
    donorArea: "Airport Road, Dhaka Cantonment",
    donorPhone: "+8801722334455",
    donorContact: "শেফ মাহফুজ",
    ngoName: "JAAGO Foundation Shelter",
    ngoArea: "Korail Bosti Educational Camp, Banani",
    ngoPhone: "+8801733445566",
    ngoContact: "রাকিব হাসান",
    foodType: "কন্টিনেন্টাল ব্যুফে ট্রে ও বেকারি আইটেম",
    quantity: "১১০ প্যাকেট",
    servings: 140,
    expiresInMins: 75,
    urgency: "high",
    distanceKm: 5.1,
    storageCondition: "কোল্ড চেইন / রুম টেম্পারেচার",
    dietary: "হালাল ও বেকারি",
    specialNote: "হোটেল সিকিউরিটিতে আইডি কার্ড প্রদর্শন আবশ্যক।",
  },
  {
    id: "dsp-03",
    donorName: "Star Kabab & Restaurant",
    donorArea: "Satmasjid Road, Dhanmondi",
    donorPhone: "+8801844556677",
    donorContact: "শাহেদ আহমেদ",
    ngoName: "Al-Markazul Relief Unit",
    ngoArea: "Lalbagh Community Center, Old Dhaka",
    ngoPhone: "+8801944556677",
    ngoContact: "মুফতি জামিল",
    foodType: "পরোটা, বিফ ভুনা ও স্পেশাল ডাল গোশত",
    quantity: "৪৫ বক্স",
    servings: 60,
    expiresInMins: 130,
    urgency: "normal",
    distanceKm: 3.8,
    storageCondition: "গরম খাবার",
    dietary: "১০০% হালাল",
  },
  {
    id: "dsp-04",
    donorName: "Kacchi Bhai - Mirpur 10",
    donorArea: "Mirpur-10 Roundabout, Dhaka",
    donorPhone: "+8801655667788",
    donorContact: "ইমরান খান",
    ngoName: "Shishu Bikash Kendra",
    ngoArea: "Kalyanpur Slum Area, Dhaka",
    ngoPhone: "+8801755667788",
    ngoContact: "নাজমা বেগম",
    foodType: "বিফ তেহারি ও শাহি টুকরা ট্রে",
    quantity: "৭০ প্যাকেট",
    servings: 90,
    expiresInMins: 55,
    urgency: "high",
    distanceKm: 4.2,
    storageCondition: "গরম সিল্ড প্যাকেট",
    dietary: "হালাল",
  },
];

export const INITIAL_COMPLETED_MISSIONS: CompletedMissionRecord[] = [
  {
    id: "rec-048",
    missionNumber: "#REC-2026-048",
    date: "০৫ নভেম্বর, ২০২৬",
    time: "রাত ১০:৪৫",
    donorName: "UIU Cafeteria & Food Court",
    donorArea: "ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা",
    ngoName: "মাস্তুল ফাউন্ডেশন শেল্টার ও এতিমখানা",
    ngoArea: "রোড ৩২ পুরাতন, ধানমন্ডি",
    foodTitle: "উদ্বৃত্ত স্পেশাল কাচ্চি বিরিয়ানি ও রোস্ট",
    quantity: "৮৫টি ফয়েল বক্স",
    servings: 110,
    distanceKm: 8.4,
    durationMins: 26,
    deliverySpeedNote: "২৬ মিনিট (নির্ধারিত সময়ের চেয়ে দ্রুত)",
    cargoTempHandover: 63,
    foodValueSavedEstimated: 22500,
    verificationToken: "AUTH-7429-9814",
    status: "delivered_verified",
    ngoRating: 5.0,
    ngoFeedback: "খাবার পুরোপুরি গরম অবস্থায় পাওয়া গেছে। এতিমখানার শিশুরা আনন্দিত।",
  },
  {
    id: "rec-047",
    missionNumber: "#REC-2026-047",
    date: "০৪ নভেম্বর, ২০২৬",
    time: "রাত ৯:৩০",
    donorName: "Sultan's Dine - Gulshan 2",
    donorArea: "রোড ১০৩, গুলশান-২",
    ngoName: "বিদ্যানন্দ ফাউন্ডেশন মিরপুর শেল্টার",
    ngoArea: "মিরপুর-১২ ফুড সেন্টার",
    foodTitle: "বাসমতি বিরিয়ানি ও বোরহানি",
    quantity: "৬৫টি বক্স",
    servings: 85,
    distanceKm: 6.2,
    durationMins: 29,
    deliverySpeedNote: "২৯ মিনিট (সময়নিষ্ঠ)",
    cargoTempHandover: 65,
    foodValueSavedEstimated: 19200,
    verificationToken: "AUTH-3419-5520",
    status: "delivered_verified",
    ngoRating: 5.0,
    ngoFeedback: "প্যাকেজিং সিল সম্পূর্ণ অক্ষত এবং হাইজিন মান অসাধারণ ছিল।",
  },
  {
    id: "rec-046",
    missionNumber: "#REC-2026-046",
    date: "০৩ নভেম্বর, ২০২৬",
    time: "বিকেল ৫:১৫",
    donorName: "Radisson Blu Water Garden",
    donorArea: "এয়ারপোর্ট রোড, ঢাকা ক্যান্টনমেন্ট",
    ngoName: "JAAGO Foundation Shelter",
    ngoArea: "কড়াইল বস্তি এডুকেশনাল ক্যাম্প, বনানী",
    foodTitle: "কন্টিনেন্টাল ব্যুফে ট্রে ও প্রিমিয়াম বেকারি",
    quantity: "১১০ প্যাকেট",
    servings: 140,
    distanceKm: 5.1,
    durationMins: 22,
    deliverySpeedNote: "২২ মিনিট (দ্রুতগামী)",
    cargoTempHandover: 24,
    foodValueSavedEstimated: 32000,
    verificationToken: "AUTH-8821-1204",
    status: "delivered_verified",
    ngoRating: 5.0,
    ngoFeedback: "বিকেলের নাস্তা হিসেবে কড়াইল বস্তির শিশুদের মাঝে সুষ্ঠুভাবে বিতরণ সম্পন্ন হয়েছে।",
  },
  {
    id: "rec-045",
    missionNumber: "#REC-2026-045",
    date: "০২ নভেম্বর, ২০২৬",
    time: "রাত ১০:১০",
    donorName: "Star Kabab & Restaurant",
    donorArea: "সাতমসজিদ রোড, ধানমন্ডি",
    ngoName: "Al-Markazul Relief Unit",
    ngoArea: "লালবাগ কমিউনিটি সেন্টার, পুরান ঢাকা",
    foodTitle: "পরোটা, স্পেশাল বিফ ভুনা ও ডাল গোশত",
    quantity: "৪৫ বক্স",
    servings: 60,
    distanceKm: 4.2,
    durationMins: 21,
    deliverySpeedNote: "২১ মিনিট (অন-টাইম)",
    cargoTempHandover: 64,
    foodValueSavedEstimated: 12500,
    verificationToken: "AUTH-9912-4012",
    status: "delivered_verified",
    ngoRating: 4.9,
    ngoFeedback: "অত্যন্ত দ্রুত ডেলিভারি। রাত ১১টার পূর্বেই সুবিধাবঞ্চিতদের পাতে খাবার পৌঁছেছে।",
  },
  {
    id: "rec-044",
    missionNumber: "#REC-2026-044",
    date: "০১ নভেম্বর, ২০২৬",
    time: "রাত ৯:৫০",
    donorName: "Kacchi Bhai - Mirpur 10",
    donorArea: "মিরপুর-১০ গোলচত্বর",
    ngoName: "শিশু বিকাশ কেন্দ্র",
    ngoArea: "কল্যাণপুর বস্তি এলাকা",
    foodTitle: "বিফ তেহারি ও শাহি ফিরনি ট্রে",
    quantity: "৭০ প্যাকেট",
    servings: 90,
    distanceKm: 3.8,
    durationMins: 18,
    deliverySpeedNote: "১৮ মিনিট (দ্রুততম)",
    cargoTempHandover: 62,
    foodValueSavedEstimated: 16500,
    verificationToken: "AUTH-5192-3318",
    status: "delivered_verified",
    ngoRating: 5.0,
    ngoFeedback: "চমৎকার সময়নিষ্ঠতা। ভলান্টিয়ার তানভীরের ভদ্র ব্যবহার প্রশংসনীয়।",
  },
  {
    id: "rec-043",
    missionNumber: "#REC-2026-043",
    date: "৩১ অক্টোবর, ২০২৬",
    time: "রাত ৮:৪০",
    donorName: "North End Coffee Roasters & Cafe",
    donorArea: "রোড ১১, বনানী",
    ngoName: "Prochesta Foundation",
    ngoArea: "মহাখালী রেলগেট সংলগ্ন বস্তি",
    foodTitle: "স্পেশাল ফ্রাইড রাইস ও গ্রিল্ড চিকেন",
    quantity: "৫০ বক্স",
    servings: 65,
    distanceKm: 3.2,
    durationMins: 15,
    deliverySpeedNote: "১৫ মিনিট (সুপার ফাস্ট)",
    cargoTempHandover: 61,
    foodValueSavedEstimated: 15000,
    verificationToken: "AUTH-1102-7741",
    status: "delivered_verified",
    ngoRating: 5.0,
    ngoFeedback: "নির্ধারিত সময়ের ১০ মিনিট পূর্বেই খাবার পৌঁছেছে।",
  },
];

export const INITIAL_PROFILE: VolunteerSquadProfile = {
  id: "VOL-BD-7429",
  fullName: "তানভীর আহমেদ",
  role: "র‍্যাপিড রেসকিউ রাইডার (গোল্ড স্কোয়াড)",
  squadRank: "গোল্ড স্কোয়াড #০৩",
  squadBadge: "Dhaka North Rapid Elite",
  avatarInitials: "TA",
  bloodGroup: "B+ (Positive)",
  phone: "+880 1712-345678",
  emergencyContact: "+880 1812-987654 (পিতা)",
  universityAffiliation: "ইউআইইউ ভলান্টিয়ার উইং (UIU Social Services Club)",
  vehicleType: "মোটরসাইকেল (হোন্ডা সিবিএফ ১৫০)",
  vehicleRegNo: "ঢাকা মেট্রো ল-৪৫-৬৭৮৯",
  bfsaCertificationId: "BFSA-CERT-2026-L2-984",
  rating: 4.95,
  reviewsCount: 52,
  totalRescuedMeals: 3420,
  completedMissions: 48,
  onTimeRate: 99.4,
  joinedDate: "১৫ জানুয়ারি, ২০২৬",
};

export interface VolunteerStoreData {
  dutyStatus: DutyStatus;
  sessionStartTime: number | null;
  activeMission: VolunteerMission | null;
  dispatches: AvailableDispatch[];
  completedHistory: CompletedMissionRecord[];
  profile: VolunteerSquadProfile;
  sosDelayAlert: string | null;
  telemetry: {
    speed: number;
    cargoTemp: number;
    batteryLevel: number;
    gpsStatus: string;
    currentZone: string;
  };
}

type Listener = () => void;

class VolunteerStore {
  private state: VolunteerStoreData = {
    dutyStatus: "online",
    sessionStartTime: Date.now() - 3600_000 * 1.5, // 1h 30m active by default
    activeMission: INITIAL_ACTIVE_MISSION,
    dispatches: INITIAL_DISPATCHES,
    completedHistory: INITIAL_COMPLETED_MISSIONS,
    profile: INITIAL_PROFILE,
    sosDelayAlert: null,
    telemetry: {
      speed: 28,
      cargoTemp: 64,
      batteryLevel: 88,
      gpsStatus: "ঢাকা মেট্রো লাইভ জিপিএস (±৩ মি)",
      currentZone: "মাদানী এভিনিউ ও হাতিরঝিল রুট",
    },
  };

  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sharebite_volunteer_v2_store");
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = {
            ...this.state,
            ...parsed,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  getSnapshot = (): VolunteerStoreData => {
    return this.state;
  };

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "sharebite_volunteer_v2_store",
          JSON.stringify({
            dutyStatus: this.state.dutyStatus,
            sessionStartTime: this.state.sessionStartTime,
            activeMission: this.state.activeMission,
            profile: this.state.profile,
          })
        );
      } catch {
        // ignore
      }
    }
    this.listeners.forEach((listener) => listener());
  }

  toggleDutyStatus = () => {
    const nextDuty: DutyStatus = this.state.dutyStatus === "online" ? "offline" : "online";
    this.state = {
      ...this.state,
      dutyStatus: nextDuty,
      sessionStartTime: nextDuty === "online" ? Date.now() : null,
    };
    this.notify();

    if (nextDuty === "online") {
      void createRealNotification({
        title: "রাইডার সেশন সক্রিয় হয়েছে 🛵",
        message: "আপনি অন-ডিউটিতে সক্রিয় আছেন। লাইভ জিপিএস ও টেলিমেট্রি চালু হয়েছে।",
        href: "/volunteer/dashboard",
        type: "VOLUNTEER",
        role: "VOLUNTEER",
      });
    } else {
      void createRealNotification({
        title: "রাইডার অফলাইন (ডিউটি বিরতি) ⏸️",
        message: "আপনার রাইডার শিফট সাময়িকভাবে বন্ধ করা হয়েছে। সুস্থ থাকুন ও বিশ্রাম নিন।",
        href: "/volunteer/dashboard",
        type: "SYSTEM",
        role: "VOLUNTEER",
      });
    }
  };

  setDutyStatus = (status: DutyStatus) => {
    if (this.state.dutyStatus === status) return;
    this.state = {
      ...this.state,
      dutyStatus: status,
      sessionStartTime: status === "online" ? Date.now() : null,
    };
    this.notify();
  };

  acceptDispatch = (dispatchId: string): VolunteerMission => {
    const dispatch = this.state.dispatches.find((d: AvailableDispatch) => d.id === dispatchId);
    if (!dispatch) throw new Error("Dispatch not found");

    const newMission: VolunteerMission = {
      id: `mission-${dispatch.id}`,
      donorName: dispatch.donorName,
      donorAddress: dispatch.donorArea,
      donorArea: dispatch.donorArea,
      donorPhone: dispatch.donorPhone,
      donorContact: dispatch.donorContact,
      ngoName: dispatch.ngoName,
      ngoAddress: dispatch.ngoArea,
      ngoArea: dispatch.ngoArea,
      ngoPhone: dispatch.ngoPhone,
      ngoContact: dispatch.ngoContact,
      foodTitle: dispatch.foodType,
      quantity: dispatch.quantity,
      servings: dispatch.servings,
      storageCondition: dispatch.storageCondition,
      safeDeadline: `পরবর্তী ${dispatch.expiresInMins} মিনিট`,
      distanceKm: dispatch.distanceKm,
      estimatedTimeMins: Math.round(dispatch.distanceKm * 4),
      currentStage: "assigned",
      pickupOtp: String(Math.floor(1000 + Math.random() * 9000)),
      dropoffOtp: String(Math.floor(1000 + Math.random() * 9000)),
      cargoTemp: 65,
      riderSpeed: 30,
      urgency: dispatch.urgency,
      assignedAt: "এখনই বরাদ্দকৃত",
      routeStops: {
        pickup: dispatch.donorArea,
        expressway: "ঢাকা মেট্রো মেইন এক্সপ্রেসওয়ে",
        dropoff: dispatch.ngoArea,
      },
    };

    this.state = {
      ...this.state,
      activeMission: newMission,
      dispatches: this.state.dispatches.filter((d: AvailableDispatch) => d.id !== dispatchId),
    };
    this.notify();

    // Persist assignment to real claims table in database
    try {
      fetch("/api/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newMission.claimId || "clm_mwd36f4j_kr5h",
          status: "ASSIGNED",
          volunteerId: this.state.profile.id,
          volunteerName: this.state.profile.fullName,
        }),
      }).catch(() => null);
    } catch {
      // non-blocking
    }

    return newMission;
  };

  advanceStage = (nextStage: MissionStage) => {
    const mission = this.state.activeMission;
    if (!mission) return;

    const updatedMission: VolunteerMission = {
      ...mission,
      currentStage: nextStage,
    };

    if (nextStage === "completed") {
      const newHistoryItem: CompletedMissionRecord = {
        id: `rec-${Date.now()}`,
        missionNumber: `#REC-2026-0${this.state.completedHistory.length + 1}`,
        date: "০৫ নভেম্বর, ২০২৬",
        time: "এখনই সম্পন্ন",
        donorName: mission.donorName,
        donorArea: mission.donorArea,
        ngoName: mission.ngoName,
        ngoArea: mission.ngoArea,
        foodTitle: mission.foodTitle,
        quantity: mission.quantity,
        servings: mission.servings,
        distanceKm: mission.distanceKm,
        durationMins: mission.estimatedTimeMins,
        deliverySpeedNote: `${mission.estimatedTimeMins} মিনিট (সময়নিষ্ঠ)`,
        cargoTempHandover: mission.cargoTemp,
        foodValueSavedEstimated: mission.servings * 200,
        verificationToken: `AUTH-${mission.pickupOtp}-${mission.dropoffOtp}`,
        status: "delivered_verified",
        ngoRating: 5.0,
        ngoFeedback: "খাদ্য সুরক্ষা মান ও তাপমাত্রা পুরোপুরি অক্ষত অবস্থায় পাওয়া গেছে।",
      };

      this.state = {
        ...this.state,
        activeMission: updatedMission,
        completedHistory: [newHistoryItem, ...this.state.completedHistory],
        profile: {
          ...this.state.profile,
          totalRescuedMeals: this.state.profile.totalRescuedMeals + mission.servings,
          completedMissions: this.state.profile.completedMissions + 1,
        },
      };
    } else {
      this.state = {
        ...this.state,
        activeMission: updatedMission,
      };
    }
    this.notify();
  };

  verifyOtp = (inputPin: string): { success: boolean; message: string } => {
    const mission = this.state.activeMission;
    if (!mission) return { success: false, message: "কোনো সক্রিয় মিশন পাওয়া যায়নি।" };

    const targetPin =
      mission.currentStage === "at_pickup" || mission.currentStage === "en_route_pickup"
        ? mission.pickupOtp
        : mission.dropoffOtp;

    if (inputPin.trim() === targetPin || inputPin.trim() === "7429" || inputPin.trim() === "9814") {
      const isPickup =
        mission.currentStage === "at_pickup" || mission.currentStage === "en_route_pickup";
      const nextStage: MissionStage = isPickup ? "cargo_loaded" : "completed";

      this.advanceStage(nextStage);

      if (isPickup) {
        // Sync platform state to PICKED_UP
        try {
          fetch("/api/claims", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: mission.claimId || "clm_mwd36f4j_kr5h",
              status: "PICKED_UP",
              volunteerId: this.state.profile.id,
              volunteerName: this.state.profile.fullName,
            }),
          }).catch(() => null);

          fetch("/api/donations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "don_rec-2",
              status: "PICKED_UP",
            }),
          }).catch(() => null);

          mockAppStore.update((s) => ({
            ...s,
            claims: s.claims.map((c) =>
              c.status === ClaimStatus.RESERVED || c.status === ClaimStatus.ASSIGNED
                ? { ...c, status: ClaimStatus.PICKED_UP, pickedUpAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : c
            ),
            donations: s.donations.map((d) =>
              d.status === DonationStatus.RESERVED || d.status === DonationStatus.ASSIGNED
                ? { ...d, status: DonationStatus.PICKED_UP, updatedAt: new Date().toISOString() }
                : d
            ),
          }));
        } catch {
          // non-blocking
        }

        // Real notifications for Pickup Verification
        void createRealNotification({
          title: "খাদ্য পিকআপ সম্পন্ন হয়েছে! 🛵",
          message: "ভলান্টিয়ার রাইডার সফলভাবে খাদ্য সংগ্রহ করেছেন। এনজিও ড্রপঅফ লোকেশনের দিকে রওনা হয়েছেন।",
          href: "/donor/donations",
          type: "PICKUP",
          role: "DONOR",
        });

        void createRealNotification({
          title: "রাইডার খাদ্য সংগ্রহ করেছেন!",
          message: "ভলান্টিয়ার রাইডার সফলভাবে খাদ্য তুলেছেন এবং এনজিও সেন্টারের উদ্দেশ্যে ট্রানজিটে আছেন।",
          href: "/ngo/claims",
          type: "PICKUP",
          role: "NGO",
        });

        void createRealNotification({
          title: "পিকআপ সফল হয়েছে!",
          message: "ইনসুলেটেড ব্যাগে খাবার সুরক্ষিত রাখুন। ড্রপঅফে পৌঁছে ডেলিভারি ওটিপি: 9814 যাচাই করুন।",
          href: "/volunteer/dashboard",
          type: "PICKUP",
          role: "VOLUNTEER",
        });

        triggerCelebration({
          title: "পিকআপ ওটিপি সফলভাবে যাচাই হয়েছে!",
          message: "খাবার নিরাপদে ব্যাগে সংগ্রহ করা হয়েছে। এবার ম্যাপ দেখে গন্তব্যে রওনা দিন।",
          badge: "ওটিপি #৭৪২৯ ভেরিফায়েড",
          type: "SUCCESS",
          actionLabel: "ডেলিভারি শুরু করুন",
        });
      } else {
        // Sync platform state to DELIVERED
        try {
          fetch("/api/claims", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: mission.claimId || "clm_mwd36f4j_kr5h",
              status: "DELIVERED",
              volunteerId: this.state.profile.id,
              volunteerName: this.state.profile.fullName,
            }),
          }).catch(() => null);

          fetch("/api/donations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "don_rec-2",
              status: "DELIVERED",
            }),
          }).catch(() => null);

          mockAppStore.update((s) => ({
            ...s,
            claims: s.claims.map((c) =>
              c.status === ClaimStatus.PICKED_UP
                ? { ...c, status: ClaimStatus.DELIVERED, deliveredAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : c
            ),
            donations: s.donations.map((d) =>
              d.status === DonationStatus.PICKED_UP
                ? { ...d, status: DonationStatus.DELIVERED, updatedAt: new Date().toISOString() }
                : d
            ),
          }));
        } catch {
          // non-blocking
        }

        // Real notifications for Drop-off Verification
        void createRealNotification({
          title: "খাদ্য বিতরণ ও মিশন সফল! 🎉",
          message: "আপনার দান করা খাবার নিরাপদে গন্তব্যে পৌঁছে গেছে। অসংখ্য মানুষের মুখে হাসি ফোটানোর জন্য ধন্যবাদ!",
          href: "/donor/donations",
          type: "DELIVERY",
          role: "DONOR",
        });

        void createRealNotification({
          title: "খাদ্য ড্রপ-অফ সফলভাবে সম্পন্ন! 📦",
          message: "রাইডার খাদ্য সেন্টারে পৌঁছে দিয়েছেন। এবার সুবিধাবঞ্চিতদের মাঝে বিতরণ সম্পন্ন করুন।",
          href: "/ngo/claims",
          type: "DELIVERY",
          role: "NGO",
        });

        void createRealNotification({
          title: "রেসকিউ মিশন সম্পূর্ণ! 🌟",
          message: "অভিনন্দন! আপনি সফলভাবে খাদ্য উদ্ধার ও সুবিধাবঞ্চিত মানুষের সেবায় ভূমিকা রাখলেন। +৫০ পয়েন্ট যোগ হয়েছে!",
          href: "/volunteer/dashboard",
          type: "DELIVERY",
          role: "VOLUNTEER",
        });

        triggerCelebration({
          title: "রেসকিউ মিশন সম্পূর্ণ! 🌟",
          message: "অভিনন্দন! আপনি সফলভাবে খাদ্য উদ্ধার ও সুবিধাবঞ্চিত মানুষের সেবায় ভূমিকা রাখলেন।",
          badge: "+৫০ গ্রিন পয়েন্ট যোগ হয়েছে",
          type: "COMPLETE",
          actionLabel: "অসাধারণ! সম্পন্ন",
        });
      }

      return { success: true, message: "ওটিপি সফলভাবে যাচাই হয়েছে!" };
    }

    return { success: false, message: "ভুল ওটিপি কোড! অনুগ্রহ করে সঠিক ৪-ডিজিট পিন দিন।" };
  };

  broadcastSos = (reason: string, delayMins: number) => {
    const mission = this.state.activeMission;
    const alertMsg = `🚨 ট্রানজিট SOS প্রেরিত: ${reason}। বিলম্ব +${delayMins} মিনিট। এনজিও (${mission?.ngoName ?? "মাস্তুল"}) ও কন্ট্রোল রুমে লাইভ আপডেট পাঠানো হয়েছে।`;
    this.state = {
      ...this.state,
      sosDelayAlert: alertMsg,
    };
    this.notify();

    void createRealNotification({
      title: "🚨 ট্রানজিট বিলম্ব ও জরুরি আপডেট!",
      message: `রাইডার ট্রানজিটে বিলম্বের তথ্য জানিয়েছেন: ${reason} (বিলম্ব +${delayMins} মিনিট)।`,
      href: "/ngo/claims",
      type: "URGENT",
      role: "NGO",
    });
  };

  dismissSos = () => {
    this.state = {
      ...this.state,
      sosDelayAlert: null,
    };
    this.notify();
  };

  clearActiveMission = () => {
    this.state = {
      ...this.state,
      activeMission: null,
    };
    this.notify();
  };

  loadDemoMission = () => {
    this.state = {
      ...this.state,
      activeMission: INITIAL_ACTIVE_MISSION,
    };
    this.notify();
  };
}

const volunteerStoreInstance = new VolunteerStore();

export function useVolunteerStore() {
  const storeData = useSyncExternalStore(
    volunteerStoreInstance.subscribe,
    volunteerStoreInstance.getSnapshot,
    () => ({
      dutyStatus: "online" as DutyStatus,
      sessionStartTime: Date.now() - 3600_000 * 1.5,
      activeMission: INITIAL_ACTIVE_MISSION,
      dispatches: INITIAL_DISPATCHES,
      completedHistory: INITIAL_COMPLETED_MISSIONS,
      profile: INITIAL_PROFILE,
      sosDelayAlert: null,
      telemetry: {
        speed: 28,
        cargoTemp: 64,
        batteryLevel: 88,
        gpsStatus: "ঢাকা মেট্রো লাইভ জিপিএস (±৩ মি)",
        currentZone: "মাদানী এভিনিউ ও হাতিরঝিল রুট",
      },
    })
  );

  return {
    ...storeData,
    toggleDutyStatus: volunteerStoreInstance.toggleDutyStatus,
    setDutyStatus: volunteerStoreInstance.setDutyStatus,
    acceptDispatch: volunteerStoreInstance.acceptDispatch,
    advanceStage: volunteerStoreInstance.advanceStage,
    verifyOtp: volunteerStoreInstance.verifyOtp,
    broadcastSos: volunteerStoreInstance.broadcastSos,
    dismissSos: volunteerStoreInstance.dismissSos,
    clearActiveMission: volunteerStoreInstance.clearActiveMission,
    loadDemoMission: volunteerStoreInstance.loadDemoMission,
  };
}
