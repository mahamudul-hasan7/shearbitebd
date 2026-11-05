import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";

export const metadata: Metadata = {
  title: "ShareBite BD — স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক",
  description:
    "বাংলাদেশের ক্যাফেটেরিয়া, রেস্তোরাঁ ও বিয়ের মেজবানের অতিরিক্ত খাবার নষ্ট না করে সঠিক সময়ে নিবন্ধিত এনজিও ও মানুষের কাছে পৌঁছে দেওয়ার প্ল্যাটফর্ম।",
};

export default function HomePage() {
  return <HomeView />;
}
