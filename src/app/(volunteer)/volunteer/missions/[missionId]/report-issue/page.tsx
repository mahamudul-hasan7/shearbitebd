import { IncidentReportScreen } from "@/features/incidents/incident-report";
export default async function Page({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const claimId = missionId.startsWith("mission-") ? missionId.slice(8) : missionId;
  return <IncidentReportScreen role="volunteer" claimId={claimId} />;
}
