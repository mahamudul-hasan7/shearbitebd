import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Secure account access" title="Welcome back to the rescue network." description="Continue coordinating safe, verified, and time-sensitive food rescue operations.">
      <Link href={ROUTES.auth.onboarding} className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-700 hover:text-brand-800">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-600">ShareBite BD account</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-900 sm:text-5xl">Welcome back</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-600 sm:text-base">Log in to continue rescuing food and creating measurable impact.</p>
      <div className="mt-7"><LoginForm /></div>
      <div className="mt-7 flex items-center justify-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
        <ShieldCheck className="size-5 shrink-0" />
        <span className="font-bold">Safe, verified, and transparent food rescue.</span>
      </div>
    </AuthShell>
  );
}
