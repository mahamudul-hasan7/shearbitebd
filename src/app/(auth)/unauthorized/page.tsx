import { ShieldX } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Access Restricted" };

export default function UnauthorizedPage() {
  return (
    <AuthShell artworkVariant="security" eyebrow="Role-aware access" title="The requested portal belongs to another account role." description="Mock guards keep donor, NGO, and volunteer navigation separated while the real backend is still pending.">
      <span className="grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger-strong"><ShieldX className="size-8" /></span>
      <h1 className="mt-5 text-3xl font-black text-brand-900 sm:text-4xl">Access restricted</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-600">This is a frontend-only role check, not a production authorization guarantee. Log in with the correct demo role to continue.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <ButtonLink href={ROUTES.auth.login}>Return to login</ButtonLink>
        <ButtonLink href={ROUTES.auth.roleSelection} variant="outline">View account roles</ButtonLink>
      </div>
    </AuthShell>
  );
}
