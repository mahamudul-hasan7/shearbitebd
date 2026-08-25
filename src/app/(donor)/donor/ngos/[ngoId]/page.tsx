import { DonorNGOProfile } from "@/features/ngos/ngo-profile";

export const metadata = { title: "NGO Profile", description: "Review a verified NGO's mission, public profile, service areas, and mock impact." };

export default async function DonorNGOProfilePage({ params }: { params: Promise<{ ngoId: string }> }) {
  const { ngoId } = await params;
  return <DonorNGOProfile ngoId={ngoId} />;
}
