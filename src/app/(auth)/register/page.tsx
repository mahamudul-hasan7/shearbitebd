import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "রেজিস্ট্রেশন করুন | ShareBite BD",
  description: "ShareBite BD উদ্বৃত্ত খাদ্য সুরক্ষা ও বণ্টন নেটওয়ার্কে যুক্ত হোন।",
};

export default function RegisterPage() {
  return (
    <AuthShell
      artworkVariant="security"
      title="খাবার বাঁচিয়ে মানুষের মুখে হাসি ফোটানোর অঙ্গীকার।"
      description="ক্যাফেটেরিয়া, রেস্তোরাঁ ও দাতব্য সংস্থাগুলোর জন্য সমন্বিত অনবোর্ডিং। মাত্র ৩টি সহজ ধাপে আপনার ভূমিকা নির্বাচন করে নেটওয়ার্কে যুক্ত হোন।"
      eyebrow="সিভিক ফুড অনবোর্ডিং"
      contentClassName="max-w-2xl"
    >
      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 font-heading">
              <span className="size-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              রেজিস্ট্রেশন ফর্ম প্রস্তুত হচ্ছে...
            </div>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
