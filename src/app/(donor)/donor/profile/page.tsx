import { DonorProfileView } from "@/features/donor-account/donor-profile";

export const metadata = {
  title: "দাতা প্রোফাইল | ShareBite BD",
  description: "সংরক্ষিত পরিচয়, যোগাযোগ ও খাদ্য উদ্ধারের তথ্য।",
};

export default function DonorProfilePage() {
  return <DonorProfileView />;
}
