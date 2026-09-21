import { IncidentReportScreen } from "@/features/incidents/incident-report";

export const metadata = { title: "Report Rescue Issue | ShareBite BD", description: "Submit a structured rescue incident for review." };

export default async function NGOReportIssuePage({ params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <IncidentReportScreen claimId={claimId} />;
}
