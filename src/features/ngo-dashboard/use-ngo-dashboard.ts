"use client";

import { useEffect, useState } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { UserRole } from "@/lib/constants/roles";
import { ClaimStatus, DonationStatus, STATUS_META } from "@/lib/constants/statuses";
import { ROUTES } from "@/lib/routes";
import { asyncState, requestService, claimService, donationService, impactService, notificationService, profileService, toServiceError, type AsyncState } from "@/services";
import type { ViewerContext } from "@/types/domain";
import type { NGOActivity, NGODashboardData } from "./types";
import { nearbyOverview, orderActiveClaims } from "./dashboard-presentation";

// Compatibility arguments for older callers; APIs always resolve the session identity.
export const NGO_USER_ID = "user-ngo-hope";
export const NGO_PROFILE_ID = "ngo-hope";
export const NGO_VIEWER: ViewerContext = {userId:NGO_USER_ID,ngoProfileId:NGO_PROFILE_ID,role:UserRole.NGO};
const ACTIVE_CLAIMS = [ClaimStatus.RESERVED,ClaimStatus.ASSIGNED,ClaimStatus.PICKED_UP,ClaimStatus.DELIVERED,ClaimStatus.DISPUTED];

export function useNgoDashboard() {
  const {session} = useMockAuth();
  const userId = session?.role === "NGO" ? session.id : undefined;
  const ngoId = session?.ngoProfileId;
  const [snapshot,setSnapshot] = useState<{owner:string;state:AsyncState<NGODashboardData>}>();
  const [retryKey,setRetryKey] = useState(0);
  useEffect(() => {
    if (!userId || !ngoId) return;
    const owner = userId;
    const profileId = ngoId;
    const controller = new AbortController();
    const options = {signal:controller.signal};
    let inFlight = false;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        const [profile,donations,claims,impact,notifications,requests] = await Promise.all([
          profileService.getOwnProfile(owner,{},options),donationService.list({},options),claimService.list({},options),
          impactService.getNgoOverview(profileId,{},options),notificationService.listForUser(owner,{},options),requestService.list({},options),
        ]);
        const ngo = profile.ngoProfile;
        if (controller.signal.aborted || profile.user.id !== owner || !ngo || ngo.id !== profileId) return;
        const active = claims.filter(claim => claim.ngoProfileId === profileId && ACTIVE_CLAIMS.includes(claim.status));
        // Reuse the list response; only older claims outside its limit need a detail request.
        const byId = new Map(donations.map(donation => [donation.id,donation]));
        await Promise.all(active.filter(claim => !byId.has(claim.donationId)).map(async claim => { const donation = await donationService.getById(claim.donationId,{},options); byId.set(donation.id,donation); }));
        if (controller.signal.aborted) return;
        const activeClaims = orderActiveClaims(active.map(claim => ({claim,donation:byId.get(claim.donationId)!})));
        const available = donations.filter(donation => donation.status === DonationStatus.AVAILABLE && Date.parse(donation.safePickupDeadline) > Date.now());
        const nearby = nearbyOverview(profile,available);
        const recommended = nearby.donations.filter(donation => ngo.acceptedFoodCategories.includes(donation.category)).sort((a,b) => Date.parse(a.safePickupDeadline)-Date.parse(b.safePickupDeadline))[0];
        const activities: NGOActivity[] = [
          ...activeClaims.slice(0,3).map(({claim,donation}) => ({id:`claim-${claim.id}`,kind:"CLAIM" as const,title:donation.title,description:STATUS_META[claim.status].label,status:claim.status,timestamp:claim.updatedAt,href:ROUTES.ngo.claim(claim.id)})),
          ...notifications.slice(0,3).map(notification => ({id:`notification-${notification.id}`,kind:"NOTIFICATION" as const,title:notification.title,description:notification.message,timestamp:notification.createdAt})),
          ...requests.slice(0,2).map(request => ({id:`request-${request.id}`,kind:"REQUEST" as const,title:request.title,description:STATUS_META[request.status].label,status:request.status,timestamp:request.updatedAt,href:ROUTES.ngo.request(request.id)})),
          ...impact.recentRecords.slice(0,2).map(record => ({id:`impact-${record.id}`,kind:"IMPACT" as const,title:"Distribution recorded",description:"Saved distribution record",meals:record.mealsRescued,beneficiaries:record.beneficiariesServed,timestamp:record.recordedAt})),
        ];
        setSnapshot({owner,state:asyncState.success({profile,stats:{availableNearby:nearby.availableNearby,hasLocation:nearby.hasLocation,unmappedDonations:nearby.unmappedDonations,activeClaims:activeClaims.length,mealsDistributed:impact.mealsDistributed,beneficiariesServed:impact.beneficiariesServed},recommendedDonation:recommended,recommendedMatchScore:0,activeClaims,activities:activities.sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp)).slice(0,7),requests,notifications})});
      } catch(error) {
        if (!controller.signal.aborted) setSnapshot(previous => ({owner,state:asyncState.error(toServiceError(error),previous?.owner === owner ? previous.state.data : undefined)}));
      } finally { inFlight = false; }
    }
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    void load();
    const timer = window.setInterval(refresh,5000);
    window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",refresh);
    return () => {controller.abort();window.clearInterval(timer);window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",refresh);};
  },[userId,ngoId,retryKey]);
  const state = snapshot && snapshot.owner === userId ? snapshot.state : asyncState.loading<NGODashboardData>();
  return {state,retry:()=>setRetryKey(value=>value+1)};
}
