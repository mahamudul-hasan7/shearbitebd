"use client";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { PortalShell } from "@/components/layout/portal-shell";
import { VerificationDocumentPanel } from "@/features/verification/document-panel";
import { useMockAuth } from "@/features/auth/mock-auth";
import { ROUTES } from "@/lib/routes";
export function NGOVerification() {
  const tx = useUiText();
  const { session } = useMockAuth();
  return (
    <PortalShell
      role="ngo"
      activeHref={ROUTES.ngo.verification}
      title={tx("Account verification")}
      description={tx(
        "Submit your document, read feedback and follow the review.",
      )}
      profileName={session?.displayName}
      notificationHref={ROUTES.ngo.notifications}
    >
      <VerificationDocumentPanel />
    </PortalShell>
  );
}
