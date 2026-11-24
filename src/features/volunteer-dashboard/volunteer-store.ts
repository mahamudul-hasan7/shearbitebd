"use client";

import { getUiLocale } from "@/lib/i18n/locale";
import { apiRequest } from "@/services/http";
import { handoverService } from "@/services/handover.service";

import { useSyncExternalStore } from "react";
import { profileService } from "@/services/profile.service";
import { getClientSession } from "@/features/auth/client-session";
import type { VolunteerDuty } from "./volunteer-duty";
import type {
  AvailableDispatch,
  CompletedMissionRecord,
  DutyStatus,
  MissionStage,
  VolunteerMission,
  VolunteerSquadProfile,
} from "./volunteer-types";

export const INITIAL_PROFILE: VolunteerSquadProfile = {
  id: "", fullName: "Volunteer", role: "", squadRank: "", squadBadge: "", avatarInitials: "V",
  bloodGroup: "Not provided", phone: "", emergencyContact: "Not provided", universityAffiliation: "Volunteer account",
  vehicleType: "", vehicleRegNo: "Not provided", bfsaCertificationId: "Not provided", rating: 0, reviewsCount: 0,
  totalRescuedMeals: 0, completedMissions: 0, onTimeRate: 0, joinedDate: "",
};

export interface VolunteerStoreData {
  dutyStatus: DutyStatus;
  dutyReady: boolean;
  dutySaving: boolean;
  dutyError: string | null;
  dutyVersion: number;
  dutyHasActiveMission: boolean;
  canGoOnDuty: boolean;
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
    dutyStatus: "offline",
    dutyReady: false,
    dutySaving: false,
    dutyError: null,
    dutyVersion: -1,
    dutyHasActiveMission: false,
    canGoOnDuty: false,
    sessionStartTime: null,
    activeMission: null,
    dispatches: [],
    completedHistory: [],
    profile: INITIAL_PROFILE,
    sosDelayAlert: null,
    telemetry: {
      speed: 0,
      cargoTemp: 0,
      batteryLevel: 0,
      gpsStatus: "GPS is not connected",
      currentZone: "Location not measured",
    },
  };

  private listeners = new Set<Listener>();
  private userId?: string;


  private readonly initialSnapshot = this.state;
  getServerSnapshot = () => this.initialSnapshot;

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
    this.listeners.forEach((listener) => listener());
  }

  resetForUser = (userId?: string) => {
    if (this.userId === userId) return;
    this.userId = userId;
    this.state = { ...this.initialSnapshot, profile: { ...INITIAL_PROFILE } };
    this.notify();
  };

  private currentUser() {
    const userId = getClientSession()?.id;
    if (!userId) throw new Error("Please log in to continue.");
    this.resetForUser(userId);
    return userId;
  }

  private isCurrentUser(userId: string) {
    return this.userId === userId && getClientSession()?.id === userId;
  }

  private applyDuty(duty: VolunteerDuty, userId: string) {
    if (!this.isCurrentUser(userId) || duty.volunteerProfileId !== getClientSession()?.volunteerProfileId || duty.version < this.state.dutyVersion) return;
    this.state = { ...this.state, dutyStatus: duty.isOnDuty ? "online" : "offline", dutyReady: true,
      dutyVersion: duty.version, dutyHasActiveMission: duty.hasActiveMission, canGoOnDuty: duty.canGoOnDuty, sessionStartTime: duty.startedAt ? Date.parse(duty.startedAt) : null };
  }

  refreshDuty = async () => {
    const userId = this.currentUser();
    try {
      const { duty } = await apiRequest<{ duty: VolunteerDuty }>("/api/volunteer/duty");
      if (!this.isCurrentUser(userId)) return;
      this.applyDuty(duty, userId);
      this.state = { ...this.state, dutyError: null };
    } catch (error) {
      if (!this.isCurrentUser(userId)) return;
      this.state = { ...this.state, dutyError: error instanceof Error ? error.message : "Duty status could not load. Try again." };
    }
    this.notify();
  };

  syncWithUserSession = async (email?: string, displayName?: string, signal?: AbortSignal) => {
    void email; void displayName;
    const userId = this.currentUser();
    const bundle = await profileService.getOwnProfile("", {}, { signal });
    const volunteer = bundle.volunteerProfile;
    if (!volunteer || signal?.aborted || !this.isCurrentUser(userId) || bundle.user.id !== userId) return;
    const user = bundle.user;
    this.state = { ...this.state, profile: {
      ...INITIAL_PROFILE, id: volunteer.id, fullName: user.displayName, phone: user.phone || "",
      avatarInitials: user.displayName.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase(),
      role: volunteer.verificationStatus === "VERIFIED" ? "Verified volunteer" : "Verification pending",
      vehicleType: volunteer.transportMethod, completedMissions: volunteer.completedRescues,
      joinedDate: new Intl.DateTimeFormat(getUiLocale(), { timeZone: "Asia/Dhaka", dateStyle: "medium" }).format(new Date(user.createdAt)),
    } };
    this.notify();
    await this.fetchDispatches(signal);
  };

  setDutyStatus = async (status: DutyStatus) => {
    const userId = this.currentUser();
    if (this.state.dutySaving || (this.state.dutyReady && this.state.dutyStatus === status)) return;
    this.state = { ...this.state, dutySaving: true, dutyError: null };
    this.notify();
    try {
      const { duty } = await apiRequest<{ duty: VolunteerDuty }>("/api/volunteer/duty", { method: "PATCH", body: JSON.stringify({ isOnDuty: status === "online" }) });
      if (!this.isCurrentUser(userId)) return;
      this.applyDuty(duty, userId);
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("sharebite-volunteer-duty");
        channel.postMessage({ userId });
        channel.close();
      }
    } catch (error) {
      if (!this.isCurrentUser(userId)) return;
      this.state = { ...this.state, dutyError: error instanceof Error ? error.message : "Duty status could not be saved. Try again." };
    } finally {
      if (this.isCurrentUser(userId)) {
        this.state = { ...this.state, dutySaving: false };
        this.notify();
      }
    }
  };

  fetchDispatches = async (signal?: AbortSignal): Promise<AvailableDispatch[]> => {
    const userId = this.currentUser();
    const [dispatches, missions] = await Promise.all([
      apiRequest<{ dispatches: AvailableDispatch[]; duty: VolunteerDuty }>("/api/dispatches", { signal }),
      apiRequest<{ activeMission: VolunteerMission | null; completedHistory: CompletedMissionRecord[]; completedRescues: number }>("/api/missions", { signal }),
    ]);
    if (signal?.aborted || !this.isCurrentUser(userId) || dispatches.duty.volunteerProfileId !== getClientSession()?.volunteerProfileId) return [];
    this.applyDuty(dispatches.duty, userId);
    const previous = this.state.activeMission;
    let active = missions.activeMission;
    if (active && previous?.id === active.id && Date.parse(previous.updatedAt ?? "") > Date.parse(active.updatedAt ?? "")) active = previous;
    if (!active && previous?.currentStage === "completed" && missions.completedHistory.some((item) => item.id === previous.claimId && item.status === "delivered_verified")) active = previous;
    this.state = { ...this.state, dispatches: dispatches.dispatches, activeMission: active, completedHistory: missions.completedHistory,
      profile: { ...this.state.profile, completedMissions: missions.completedRescues, totalRescuedMeals: missions.completedHistory.reduce((n, m) => n + m.servings, 0) } };
    this.notify();
    return this.state.dispatches;
  };

  loadMission = async (missionId: string, signal?: AbortSignal) => {
    const userId = this.currentUser();
    const claimId = missionId.startsWith("mission-") ? missionId.slice(8) : missionId;
    const data = await apiRequest<{ mission: VolunteerMission }>(`/api/missions?claimId=${encodeURIComponent(claimId)}`, { signal });
    if (signal?.aborted || !this.isCurrentUser(userId)) return;
    if (this.state.activeMission?.id === data.mission.id && Date.parse(this.state.activeMission.updatedAt ?? "") > Date.parse(data.mission.updatedAt ?? "")) return;
    this.state = { ...this.state, activeMission: data.mission };
    this.notify();
  };

  acceptDispatch = async (dispatchId: string): Promise<VolunteerMission> => {
    this.currentUser();
    if (!this.state.dutyReady || this.state.dutySaving || this.state.dutyStatus !== "online") throw new Error("Turn duty ON before accepting a new mission.");
    if (!this.state.canGoOnDuty) throw new Error("Volunteer verification is required before going on duty.");
    const dispatch = this.state.dispatches.find((d) => d.id === dispatchId);
    if (!dispatch?.claimId) throw new Error("Dispatch not found.");
    try { await apiRequest("/api/dispatches", { method: "POST", body: JSON.stringify({ claimId: dispatch.claimId }) }); }
    catch (error) {
      // Assignment may already be saved when its response is lost. Continue the
      // matching mission instead of offering another acceptance of the same rescue.
      try {
        await this.fetchDispatches();
        if (this.state.activeMission?.claimId === dispatch.claimId) return this.state.activeMission;
      } catch { /* Preserve the assignment error when reconciliation is unavailable. */ }
      await this.refreshDuty().catch(() => {});
      throw error;
    }
    await this.fetchDispatches();
    if (!this.state.activeMission) throw new Error("The assigned mission could not be loaded. Refresh the page.");
    return this.state.activeMission;
  };

  advanceStage = async (nextStage: MissionStage) => {
    const mission = this.state.activeMission;
    if (!mission?.claimId) throw new Error("Load your assigned mission first.");
    if (mission.incidentPaused) throw new Error("This rescue is paused for incident review.");
    await apiRequest("/api/missions", { method: "PATCH", body: JSON.stringify({ claimId: mission.claimId, stage: nextStage }) });
    await this.loadMission(mission.id);
  };

  verifyOtp = async (inputPin: string): Promise<{ success: boolean; message: string }> => {
    const mission = this.state.activeMission;
    if (!mission?.claimId || mission.currentStage === "completed") return { success: false, message: "No active handover." };
    if (mission.incidentPaused) return { success: false, message: "This rescue is paused for incident review." };
    try {
      const kind = ["assigned", "en_route_pickup", "at_pickup"].includes(mission.currentStage) ? "PICKUP" : "DELIVERY";
      await handoverService.verify(mission.claimId, kind, inputPin);
      await this.fetchDispatches();
      await this.loadMission(mission.id);
      return { success: true, message: kind === "PICKUP" ? "Pickup verified. Food is now in transit." : "Delivery verified and saved." };
    } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Verification failed." }; }
  };

  broadcastSos = (reason: string, delayMins: number) => {
    this.state = { ...this.state, sosDelayAlert: `SOS delivery is not connected. Contact the NGO directly. Your note: ${reason}; delay: ${delayMins} minutes.` };
    this.notify();
  };

  dismissSos = () => {
    this.state = {
      ...this.state,
      sosDelayAlert: null,
    };
    this.notify();
  };

  clearActiveMission = () => {
    if (this.state.activeMission && this.state.activeMission.currentStage !== "completed") return;
    this.state = {
      ...this.state,
      activeMission: null,
    };
    this.notify();
  };


}

const volunteerStoreInstance = new VolunteerStore();

export function useVolunteerStore() {
  const storeData = useSyncExternalStore(
    volunteerStoreInstance.subscribe,
    volunteerStoreInstance.getSnapshot,
    volunteerStoreInstance.getServerSnapshot
  );

  return {
    ...storeData,
    resetForUser: volunteerStoreInstance.resetForUser,
    refreshDuty: volunteerStoreInstance.refreshDuty,
    setDutyStatus: volunteerStoreInstance.setDutyStatus,
    acceptDispatch: volunteerStoreInstance.acceptDispatch,
    advanceStage: volunteerStoreInstance.advanceStage,
    verifyOtp: volunteerStoreInstance.verifyOtp,
    broadcastSos: volunteerStoreInstance.broadcastSos,
    dismissSos: volunteerStoreInstance.dismissSos,
    clearActiveMission: volunteerStoreInstance.clearActiveMission,
    syncWithUserSession: volunteerStoreInstance.syncWithUserSession,
    fetchDispatches: volunteerStoreInstance.fetchDispatches,
    loadMission: volunteerStoreInstance.loadMission,
  };
}
