import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Reset Password", description: "Request a frontend-only ShareBite BD password reset demonstration." };

export default function ForgotPasswordPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Account recovery" title="Recover access without compromising security." description="Reset instructions will be sent only to the verified email connected to the account.">
      <Link href={ROUTES.auth.login} className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-700 hover:text-brand-800"><ArrowLeft className="size-4" /> Back to login</Link>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-600">Password recovery</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-900">Forgot password?</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-600 sm:text-base">Enter your account email and we&apos;ll prepare a secure reset link.</p>
      <div className="mt-7"><ForgotPasswordForm /></div>
    </AuthShell>
  );
}
