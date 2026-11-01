import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log In", description: "Sign in with a ShareBite BD frontend demo account." };

export default function LoginPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Verified Access" title="Welcome back to the rescue network." description="Continue coordinating safe, verified, and time-sensitive food rescue operations across Bangladesh.">
      <div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/15">
          Account Login
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Welcome back</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-normal">Enter your credentials to access your organization dashboard.</p>
      </div>
      <div className="mt-8">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-slate-100" />}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-xs text-slate-600 font-medium">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        <span>Development Preview — Use one-click demo credentials below</span>
      </div>
    </AuthShell>
  );
}
