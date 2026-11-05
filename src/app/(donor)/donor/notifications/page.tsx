import { NotificationCenter } from "@/features/donor-account/notification-center";

export const metadata = {
  title: "নোটিফিকেশন ও অ্যালার্ট সেন্টার | ShareBite BD",
  description: "উদ্বৃত্ত খাদ্য উদ্ধার, পিকআপ উইন্ডো ও ভলান্টিয়ার ট্র্যাকিংয়ের লাইভ নোটিফিকেশন।",
};

export default function DonorNotificationsPage() {
  return <NotificationCenter />;
}