import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function Avatar({ initials, size = "md", className }: { initials?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-16 text-lg" };
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-brand-100 font-extrabold text-brand-800 ring-4 ring-white", sizes[size], className)}>
      {initials ? initials.slice(0, 2).toUpperCase() : <UserRound className="size-1/2" aria-hidden="true" />}
    </span>
  );
}
