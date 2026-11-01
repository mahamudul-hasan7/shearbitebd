import { ArrowLeft, Building2, ShieldCheck, UserRoundCog, UsersRound, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RoleCard } from "@/components/auth/role-card";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Choose Your Role", description: "Choose a public donor, NGO, or volunteer registration path." };

export default function RoleSelectionPage() {
  return (
    <AuthShell eyebrow="Network Registration" title="Choose the role that matches your mission." description="Each role receives a dedicated dashboard, permissions, and workflow designed for rapid, safe surplus food rescue.">
      <Link href={ROUTES.auth.login} className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="size-3.5" /> Back to log in
      </Link>
      
      <div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-600/15">
          Account Setup
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Choose your role
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-normal">
          Select how you or your organization will participate in the surplus food rescue network.
        </p>
      </div>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
        <RoleCard icon={UtensilsCrossed} title="Food Donor" description="Post surplus meals, coordinate pickup, and monitor community impact." href={ROUTES.auth.registerDonor} />
        <RoleCard icon={Building2} title="NGO / Charity" description="Discover, claim, receive, and distribute rescued food to communities." href={ROUTES.auth.registerNgo} tone="blue" />
        <RoleCard icon={UsersRound} title="Volunteer" description="Support verified pickups and delivery routes in your local area." href={ROUTES.auth.registerVolunteer} tone="accent" badge="Open Pilot" />
        <RoleCard icon={UserRoundCog} title="Administrator" description="Platform oversight, safety verification, audits, and dispute resolution." href="#" tone="purple" disabled badge="Invite only" />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-500 font-normal">
        <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
        <p>Administrator accounts are invite-only and cannot be registered publicly to ensure platform integrity and verification security.</p>
      </div>

      <p className="mt-6 text-center text-xs sm:text-sm text-slate-600 font-medium">
        Already have an account?{" "}
        <Link href={ROUTES.auth.login} className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
