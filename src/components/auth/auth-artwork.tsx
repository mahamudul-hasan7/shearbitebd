import { Check, HeartHandshake, Leaf, PackageOpen, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthArtwork({ variant = "community", className }: { variant?: "community" | "security" | "impact"; className?: string }) {
  const centerIcon = variant === "security" ? ShieldCheck : variant === "impact" ? Leaf : HeartHandshake;
  const CenterIcon = centerIcon;

  return (
    <div className={cn("relative mx-auto h-[300px] max-w-[520px]", className)} aria-hidden="true">
      <div className="absolute inset-x-8 bottom-3 h-32 rounded-[50%] bg-white/10 blur-sm" />
      <div className="absolute left-1/2 top-10 grid size-40 -translate-x-1/2 place-items-center rounded-[3rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
        <div className="grid size-24 place-items-center rounded-[2rem] bg-white text-brand-700 shadow-xl">
          <CenterIcon className="size-12" />
        </div>
      </div>

      <div className="absolute left-8 top-32 grid size-24 place-items-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur">
        <PackageOpen className="size-11 text-accent-400" />
      </div>
      <div className="absolute right-8 top-32 grid size-24 place-items-center rounded-3xl border border-white/15 bg-white/10 backdrop-blur">
        <UsersRound className="size-11 text-brand-200" />
      </div>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur">
        <Truck className="size-6 text-accent-400" />
        <div className="h-px w-10 border-t border-dashed border-brand-200" />
        <span className="grid size-8 place-items-center rounded-full bg-brand-400 text-white"><Check className="size-5" /></span>
      </div>
    </div>
  );
}
