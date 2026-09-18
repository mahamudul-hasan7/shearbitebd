import { NGORequestDetail } from "@/features/requests/ngo-request-detail";

export const metadata = { title: "Food Request Details | ShareBite BD", description: "Review, edit, or cancel an authorized NGO food request." };

export default async function NGORequestPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return <NGORequestDetail requestId={requestId} />;
}
