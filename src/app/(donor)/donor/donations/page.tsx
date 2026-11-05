import { DonorDonationList } from "@/features/donations/donor-donation-list";

export const metadata = {
  title: "আমার খাদ্য অনুদানসমূহ | ShareBite BD",
  description: "ক্যাফেটেরিয়া ও রেস্তোরাঁর উদ্বৃত্ত খাবারের তালিকা তৈরি, লাইভ স্ট্যাটাস মনিটরিং এবং ভলান্টিয়ার ট্র্যাকিং।",
};

export default function DonorDonationsPage() {
  return <DonorDonationList />;
}