import { DonorProfileView } from "@/features/donor-account/donor-profile";

export const metadata = {
  title: "দাতা প্রোফাইল ও সনদপত্র | ShareBite BD",
  description: "বিএফএসএ (BFSA) নিরাপদ খাদ্য সনদ, জাতীয় গ্রিন সিএসআর স্বীকৃতি ও ভেরিফায়েড প্রাতিষ্ঠানিক পরিচিতি।",
};

export default function DonorProfilePage() {
  return <DonorProfileView />;
}
