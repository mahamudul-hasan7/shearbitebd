import { RequestSubmitted } from "@/features/requests/request-submitted";

export const metadata = { title: "Food Request Submitted | ShareBite BD", description: "Review the submitted NGO food request reference and next steps." };

export default async function NGORequestSubmittedPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <RequestSubmitted requestId={id} />;
}
