import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="grid place-items-center px-6 py-12 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-brand-100 text-brand-700">
        <Icon className="size-8" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-black text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
