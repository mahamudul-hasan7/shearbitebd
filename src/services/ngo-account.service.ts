import { VerificationStatus } from "@/lib/constants/domain";
import { UserRole } from "@/lib/constants/roles";
import { mockAppStore } from "@/store/mock-app-store";
import type { NGOTeamMember, NGOTeamRole, ViewerContext } from "@/types/domain";
import { createMockId, MockApiError, simulateRequest, type MockServiceOptions } from "@/services/shared";

function requireNgo(ngoProfileId: string, viewer: ViewerContext) {
  if (viewer.role !== UserRole.ADMIN && viewer.ngoProfileId !== ngoProfileId) throw new MockApiError({ code: "FORBIDDEN", message: "This NGO account is private.", status: 403, retryable: false });
}

export const ngoAccountService = {
  listTeam(ngoProfileId: string, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOTeamMember[]> {
    return simulateRequest(() => { requireNgo(ngoProfileId, viewer); return mockAppStore.getSnapshot().ngoTeamMembers.filter((item) => item.ngoProfileId === ngoProfileId).map((item) => ({ ...item })); }, options);
  },
  inviteMember(ngoProfileId: string, input: { name: string; email: string; role: NGOTeamRole }, viewer: ViewerContext, options?: MockServiceOptions): Promise<NGOTeamMember> {
    return simulateRequest(() => {
      requireNgo(ngoProfileId, viewer);
      const email = input.email.trim().toLowerCase();
      if (input.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new MockApiError({ code: "VALIDATION_ERROR", message: "Enter a valid member name and email.", status: 422, retryable: false });
      if (mockAppStore.getSnapshot().ngoTeamMembers.some((item) => item.ngoProfileId === ngoProfileId && item.email.toLowerCase() === email)) throw new MockApiError({ code: "CONFLICT", message: "This email is already on the team.", status: 409, retryable: false });
      const member: NGOTeamMember = { id: createMockId("team"), ngoProfileId, name: input.name.trim(), email, role: input.role, status: "INVITED", createdAt: new Date().toISOString() };
      mockAppStore.update((state) => ({ ...state, ngoTeamMembers: [...state.ngoTeamMembers, member] }));
      return { ...member };
    }, options);
  },
  resubmitVerification(ngoProfileId: string, documentName: string, viewer: ViewerContext, options?: MockServiceOptions) {
    return simulateRequest(() => {
      requireNgo(ngoProfileId, viewer);
      if (!documentName.trim()) throw new MockApiError({ code: "VALIDATION_ERROR", message: "Select a registration document.", status: 422, retryable: false });
      let result;
      mockAppStore.update((state) => ({ ...state, ngoProfiles: state.ngoProfiles.map((item) => { if (item.id !== ngoProfileId) return item; result = { ...item, verificationStatus: VerificationStatus.PENDING, verificationDocumentName: documentName, updatedAt: new Date().toISOString() }; return result; }) }));
      if (!result) throw new MockApiError({ code: "NOT_FOUND", message: "NGO profile not found.", status: 404, retryable: false });
      return result;
    }, options);
  },
};
