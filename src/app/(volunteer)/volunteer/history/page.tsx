import { VolunteerHistoryView } from "@/features/volunteer-dashboard/volunteer-history-view";

export const metadata = {
  title: "মিশন হিস্ট্রি ও অডিট লগ | ShareBite BD",
  description: "ভলান্টিয়ারের সম্পন্ন করা প্রতিটি রেসকিউ মিশনের পুঙ্খানুপুঙ্খ বিবরণ, রুট টাইম, তাপমাত্রা এবং ডিজিটাল রসিদ।",
};

export default function VolunteerHistoryPage() {
  return <VolunteerHistoryView />;
}
