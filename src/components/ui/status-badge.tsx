import { Badge } from "@/components/ui/badge";
import { STATUS_META, type AppStatus } from "@/lib/constants/statuses";

export function StatusBadge({ status, className }: { status: AppStatus; className?: string }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone} className={className}>{meta.label}</Badge>;
}
