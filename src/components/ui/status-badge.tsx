"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_META, STATUS_META_BN, type AppStatus } from "@/lib/constants/statuses";
import { useLanguage } from "@/lib/i18n/language-context";

export function StatusBadge({
  status,
  className,
  children,
}: {
  status: AppStatus;
  className?: string;
  children?: React.ReactNode;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const meta = STATUS_META[status];
  const label = children ?? (isBn ? STATUS_META_BN[status]?.label || meta.label : meta.label);

  return <Badge tone={meta.tone} className={className}>{label}</Badge>;
}
