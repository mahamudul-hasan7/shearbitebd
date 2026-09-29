import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto min-w-0 w-full max-w-[var(--page-max-width)] px-3 xs:px-4 sm:px-6 xl:px-8", className)} {...props} />;
}
