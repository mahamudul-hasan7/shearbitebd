import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const columns = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

export function ResponsiveGrid({ columns: count = 3, className, ...props }: HTMLAttributes<HTMLDivElement> & { columns?: 2 | 3 | 4 }) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:gap-5", columns[count], className)} {...props} />;
}
