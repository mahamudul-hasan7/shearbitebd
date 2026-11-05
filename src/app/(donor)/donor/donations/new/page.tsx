import { DonationWizard } from "@/features/donations/donation-wizard";

export const metadata = {
  title: "উদ্বৃত্ত খাবার পোস্ট করুন | ShareBite BD",
  description: "ক্যাফেটেরিয়া বা রেস্তোরাঁর তাজা অতিরিক্ত খাবারের বিবরণ ও পিকআপ তথ্য দিয়ে লাইভ ফিডে তালিকাভুক্ত করুন।",
};

export default function NewDonationPage() {
  return <DonationWizard />;
}