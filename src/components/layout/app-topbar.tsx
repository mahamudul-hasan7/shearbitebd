import { Bell, Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import type { PortalRole } from "@/types/navigation";

export function AppTopbar({ role }: { role: PortalRole }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <IconButton label="Open navigation"><Menu className="size-5" /></IconButton>
          <BrandLogo compact />
        </div>
        <div className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">ShareBite BD Portal</p>
          <p className="mt-1 text-sm text-muted-600">Responsive frontend foundation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative">
            <IconButton label="Notifications"><Bell className="size-5" /></IconButton>
            <span className="absolute right-0 top-0 size-3 rounded-full bg-accent-500 ring-2 ring-canvas" aria-hidden="true" />
          </span>
          <Avatar initials={role === "donor" ? "FD" : "NG"} size="sm" />
        </div>
      </div>
    </header>
  );
}
