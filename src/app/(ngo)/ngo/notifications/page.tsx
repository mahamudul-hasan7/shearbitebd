import { NGONotifications } from "@/features/ngo-account/ngo-notifications";

export const metadata = {
  title: "এনজিও নোটিফিকেশন হাব | ShareBite BD",
  description: "নিকটস্থ খাদ্য অ্যালার্ট, ১৫ মিনিট জরুরি ক্লেইম ও রাইডার ট্র্যাকিং নোটিফিকেশন।",
};

export default function NGONotificationsPage() {
  return <NGONotifications />;
}