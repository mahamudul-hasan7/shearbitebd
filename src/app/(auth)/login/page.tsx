import { UiText } from "@/lib/i18n/ui-text-node";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "লগইন করুন | ShareBite BD",
  description:
    "ShareBite BD উদ্বৃত্ত খাদ্য সুরক্ষা ও বণ্টন নেটওয়ার্কে প্রবেশ করুন।",
};

export default function LoginPage() {
  return (
    <AuthShell
      artworkVariant="security"
      title="Share extra food. Help it reach people."
      description="Donors, NGOs and riders coordinate food collection and delivery through ShareBite BD."
    >
      <div className="space-y-6">
        <div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-3xl font-heading">
            <UiText source={"Welcome back"} />
          </h1>
          <p className="mt-1.5 text-sm leading-7 text-slate-600">
            <UiText
              source={
                "Use your registered email or mobile number and password."
              }
            />
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
