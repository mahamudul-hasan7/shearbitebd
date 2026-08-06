import { ArrowLeft, Building2, ShieldCheck, UserRoundCog, UsersRound, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Choose Your Role" };

export default function RoleSelectionPage() {
  return (
    <AuthShell eyebrow="Join the ShareBite BD community" title="Choose the role that matches your work." description="Each role receives a focused dashboard, permissions, and workflow designed for safe food rescue coordination.">
      <Link href={ROUTES.auth.onboarding} className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-700 hover:text-brand-800"><ArrowLeft className="size-4" /> Back</Link>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-600">Account setup</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-900 sm:text-5xl">Choose your role</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-600 sm:text-base">Select how you would like to join the ShareBite BD pilot.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <RoleCard icon={UtensilsCrossed} title="Food Donor" description="Post surplus food, coordinate pickup, and track impact." href={ROUTES.auth.registerDonor} />
        <RoleCard icon={Building2} title="NGO / Organization" description="Discover, claim, receive, and distribute rescued food." href={ROUTES.auth.registerNgo} tone="blue" />
        <RoleCard icon={UsersRound} title="Volunteer" description="Support verified pickup and delivery tasks nearby." href={ROUTES.auth.registerVolunteer} tone="accent" badge="Future pilot" />
        <RoleCard icon={UserRoundCog} title="Administrator" description="Manage verification, safety review, disputes, and analytics." href="#" tone="purple" disabled badge="Invite only" />
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm leading-6 text-muted-600">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p>Administrator accounts are not publicly registered. They are created through a controlled invite process for platform safety.</p>
      </div>

      <p className="mt-7 text-center text-sm text-muted-600">Already have an account? <Link href={ROUTES.auth.login} className="font-black text-brand-700 hover:text-brand-800">Log in</Link></p>
    </AuthShell>
  );
}
