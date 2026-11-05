import { VolunteerMissionCockpit } from "@/features/volunteer-dashboard/volunteer-mission-cockpit";

export const metadata = {
  title: "রেসকিউ মিশন ককপিট | ShareBite BD",
  description: "টার্ন-বাই-টার্ন ঢাকা মেট্রো রুট, টেলিমেট্রি এবং কিউআর/ওটিপি ডিজিটাল হ্যান্ডওভার।",
};

export default async function VolunteerMissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  return <VolunteerMissionCockpit missionId={missionId} />;
}
