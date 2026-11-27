"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Radio, Repeat } from "lucide-react";
import { useMockAuth, getRoleLandingRoute } from "@/features/auth/mock-auth";
import { UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

const ROLES = [
  { label: "Donor", role: UserRole.DONOR, email: "donor@sharebite.demo", pass: "Demo1234" },
  { label: "NGO", role: UserRole.NGO, email: "ngo@sharebite.demo", pass: "Demo1234" },
  { label: "Rider", role: UserRole.VOLUNTEER, email: "volunteer@sharebite.demo", pass: "Demo1234" },
  { label: "Admin", role: UserRole.ADMIN, email: "admin", pass: "admin123" },
] as const;

export function DemoRoleSwitcher() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { session, signIn } = useMockAuth();
  const isFocusedMobileFlow =
    /\/(new|edit|tracking|confirm-delivery|distribution)\/?$/.test(pathname) ||
    pathname.includes("/missions/");
  const [busyRole, setBusyRole] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live">("connecting");
  const [lastEvent, setLastEvent] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!session) return;
    const source = new EventSource("/api/events/stream");
    source.addEventListener("connected", () => setLiveStatus("live"));
    source.addEventListener("rescue", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as { summary?: string };
        if (data.summary) setLastEvent(data.summary);
        window.dispatchEvent(new Event("sharebite:live-update"));
        router.refresh();
      } catch {
        // Ignore malformed payloads.
      }
    });
    source.onerror = () => setLiveStatus("connecting");
    return () => source.close();
  }, [session, router]);

  async function switchTo(target: (typeof ROLES)[number]) {
    if (busyRole) return;
    setBusyRole(target.role);
    try {
      await signIn({ email: target.email, password: target.pass, remember: true });
      setOpen(false);
      window.location.assign(getRoleLandingRoute(target.role));
    } finally {
      setBusyRole(null);
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-[calc(5.8rem+env(safe-area-inset-bottom))] right-3 z-40 max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:right-4 lg:bottom-4",
        isFocusedMobileFlow ? "hidden lg:flex" : "flex",
      )}
    >
      {!minimized && lastEvent && (
        <div className="pointer-events-auto max-w-xs rounded-xl border border-emerald-300 bg-emerald-950/95 px-3.5 py-2 text-xs font-medium text-emerald-100 shadow-lg backdrop-blur">
          <span className="font-bold text-emerald-300">Live: </span>
          {lastEvent}
        </div>
      )}

      {!minimized && open && (
        <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-2xl backdrop-blur-md">
          <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Demo Switcher
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((item) => {
              const current = session?.role === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  disabled={Boolean(busyRole)}
                  onClick={() => void switchTo(item)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs font-bold transition",
                    current
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-800 hover:bg-emerald-50 hover:text-emerald-900",
                  )}
                >
                  {busyRole === item.role ? "…" : item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {minimized ? (
        <button
          type="button"
          aria-label="Expand live status and role switcher"
          onClick={() => setMinimized(false)}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#03241b]/90 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-md backdrop-blur-md hover:bg-[#063c2e] transition cursor-pointer"
        >
          <Radio
            className={cn(
              "size-3",
              liveStatus === "live" ? "text-emerald-400 animate-pulse" : "text-amber-300",
            )}
          />
          <span>{liveStatus === "live" ? "Live" : "Sync"}</span>
        </button>
      ) : (
        <div className="pointer-events-auto inline-flex items-center overflow-hidden rounded-full border border-emerald-500/40 bg-[#03241b]/95 backdrop-blur-md text-[11px] sm:text-xs font-bold text-white shadow-lg">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:pl-3.5 sm:pr-2.5 sm:py-2 hover:bg-[#063c2e] transition cursor-pointer"
          >
            <Radio
              className={cn(
                "size-3 sm:size-3.5",
                liveStatus === "live" ? "text-emerald-400 animate-pulse" : "text-amber-300",
              )}
            />
            <span>
              {liveStatus === "live" ? "Live" : "Sync"}
              <span className="hidden sm:inline">{liveStatus === "live" ? " Sync" : "ing"}</span>
            </span>
            <span className="text-white/40">|</span>
            <Repeat className="size-3 sm:size-3.5 text-amber-300" />
            <span>
              Switch<span className="hidden sm:inline"> Role</span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Minimize role switcher"
            onClick={() => {
              setOpen(false);
              setMinimized(true);
            }}
            className="grid size-7 sm:size-8 place-items-center border-l border-white/15 text-white/75 hover:bg-[#063c2e] hover:text-white transition cursor-pointer"
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
