import { UiText } from "@/lib/i18n/ui-text-node";
import { ShieldX } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Access Restricted", description: "Sign in with an account authorized to use this portal." };

export default function UnauthorizedPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Role-based access" title="এই পোর্টালে প্রবেশের অনুমতি নেই।" description="এই পোর্টাল ব্যবহার করতে উপযুক্ত ভূমিকার অ্যাকাউন্টে লগইন করুন।">
      <span className="grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger-strong"><ShieldX className="size-8" /></span>
      <h1 className="mt-5 text-3xl font-black text-brand-900 sm:text-4xl"><UiText source={"Access restricted"} /></h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-600"><UiText source={"Donor, NGO এবং Volunteer-এর জন্য আলাদা পোর্টাল রয়েছে। আপনার অ্যাকাউন্টের জন্য নির্ধারিত পোর্টাল ব্যবহার করুন।"} /></p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href={ROUTES.auth.login}><UiText source={"Return to login"} /></ButtonLink>
        <ButtonLink href={ROUTES.auth.roleSelection} variant="outline"><UiText source={"View account roles"} /></ButtonLink>
      </div>
    </AuthShell>
  );
}
