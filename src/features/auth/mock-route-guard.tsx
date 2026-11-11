"use client";

import { AlertTriangle, ArrowRight, LogIn, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMockAuth } from "@/features/auth/mock-auth";
import { DEMO_ACCOUNTS } from "@/features/auth/demo-accounts";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { Button, ButtonLink } from "@/components/ui/button";

const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.DONOR]: "ফুড ডোনার (ক্যাফেটেরিয়া ও রেস্টুরেন্ট)",
  [UserRole.NGO]: "এনজিও ও চ্যারিটি",
  [UserRole.VOLUNTEER]: "ভলান্টিয়ার স্কোয়াড",
  [UserRole.ADMIN]: "প্রশাসক (অ্যাডমিন)",
};

export function MockRouteGuard({ allowedRole, children }: { allowedRole: UserRole; children: ReactNode }) {
  const { status, session, signIn } = useMockAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isRoleMatch = status === "authenticated" && session?.role === allowedRole;

  // Auto-assist during quick initial lab demo testing if completely unauthenticated
  useEffect(() => {
    if (status === "anonymous") {
      // Check if user came from a direct link without logging in, provide default demo session for this role
      const demoAccount = DEMO_ACCOUNTS.find((a) => a.role === allowedRole);
      if (demoAccount) {
        signIn({
          email: demoAccount.email,
          displayName: demoAccount.displayName,
          role: demoAccount.role,
          remember: true,
        });
      }
    }
  }, [allowedRole, signIn, status]);

  // Loading state
  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center px-4 bg-slate-50">
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 animate-pulse">
            <ShieldCheck className="size-6" />
          </span>
          <p className="mt-4 font-bold text-slate-800 font-heading">সেশন ও পারমিশন যাচাই করা হচ্ছে...</p>
        </div>
      </main>
    );
  }

  // Cross-role access restriction (Strict User-Based Separation)
  if (status === "authenticated" && session && session.role !== allowedRole) {
    const userRoleName = ROLE_NAMES[session.role] || session.role;
    const requiredRoleName = ROLE_NAMES[allowedRole] || allowedRole;

    return (
      <main className="grid min-h-screen place-items-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-rose-950/5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <ShieldAlert className="size-8" />
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 font-heading ring-1 ring-rose-200">
            ভূমিকা সীমাবদ্ধতা (Role-Based Access Control)
          </span>

          <h1 className="mt-3 text-xl font-black text-slate-900 font-heading sm:text-2xl">
            এই পেজে প্রবেশের অনুমতি নেই
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            আপনি বর্তমানে <strong className="text-slate-900">"{session.displayName}"</strong> হিসেবে <strong className="text-rose-700">({userRoleName})</strong> অ্যাকাউন্টে লগইন আছেন। 
            এই সেকশনটি শুধুমাত্র <strong className="text-emerald-700">{requiredRoleName}</strong>-দের জন্য সংরক্ষিত।
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button
              variant="primary"
              onClick={() => {
                // Switch session to required role demo account
                const targetDemo = DEMO_ACCOUNTS.find((a) => a.role === allowedRole);
                if (targetDemo) {
                  signIn({
                    email: targetDemo.email,
                    displayName: targetDemo.displayName,
                    role: targetDemo.role,
                    remember: true,
                  });
                }
              }}
              rightIcon={<ArrowRight className="size-4" />}
            >
              {requiredRoleName} হিসেবে সুইচ করুন
            </Button>
            <ButtonLink href={ROUTES.auth.login} variant="outline" leftIcon={<LogIn className="size-4" />}>
              অন্য অ্যাকাউন্টে লগইন
            </ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
