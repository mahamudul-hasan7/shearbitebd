import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "লগইন করুন | ShareBite BD",
  description: "ShareBite BD উদ্বৃত্ত খাদ্য সুরক্ষা ও বণ্টন নেটওয়ার্কে প্রবেশ করুন।",
};

export default function LoginPage() {
  return (
    <AuthShell
      artworkVariant="security"
      title="একটি ক্লিকে খাবার পৌঁছাক মানুষের পাতে।"
      description="ক্যাফেটেরিয়া ও রেস্তোরাঁর তাজা অতিরিক্ত খাবার বিদ্যানন্দ ও মাস্তুল ফাউন্ডেশনের মতো নিবন্ধিত দাতব্য প্রতিষ্ঠানে পৌঁছে দেওয়ার নিরাপদ প্ল্যাটফর্ম।"
    >
      <div className="space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/20 font-heading">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            অ্যাকাউন্ট ভেরিফায়েড এক্সেস
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
            স্বাগতম! লগইন করুন
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
            আপনার ড্যাশবোর্ডে প্রবেশ করতে আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড প্রদান করুন।
          </p>
        </div>

        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-slate-100" />}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
