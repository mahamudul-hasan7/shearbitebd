import { IncidentReportScreen } from "@/features/incidents/incident-report";
export default async function Page({ params, searchParams }: { params: Promise<{ donationId: string }>; searchParams: Promise<{ claimId?: string }> }) {
  const { donationId } = await params;
  const { claimId } = await searchParams;
  return <IncidentReportScreen role="donor" donationId={donationId} claimId={claimId} />;
}
