import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NGODiscoveryList } from "@/features/ngo-discovery/ngo-discovery-list";

export const metadata = {
  title: "উদ্বৃত্ত খাদ্য অনুসন্ধান | ShareBite BD",
  description: "ঢাকা মেট্রোর ভেরিফায়েড ক্যাফেটেরিয়া ও রেস্তোরাঁর উদ্বৃত্ত খাবার খুঁজে নিন এবং তাত্ক্ষণিক রেসকিউ ক্লেইম করুন।",
};

export default function NGODiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="h-[40rem] rounded-3xl" />
        </div>
      }
    >
      <NGODiscoveryList />
    </Suspense>
  );
}
