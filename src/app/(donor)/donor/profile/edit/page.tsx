import { ProfileEditor } from "@/features/donor-account/profile-editor";

export const metadata = {
  title: "দাতা প্রোফাইল সম্পাদনা | ShareBite BD",
  description: "প্রতিষ্ঠানের তথ্য, ফোকাল পারসন ও যোগাযোগের অফিসিয়াল বিবরণ আপডেট করুন।",
};

export default function EditDonorProfilePage() {
  return <ProfileEditor />;
}
