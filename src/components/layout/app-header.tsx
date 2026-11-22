"use client";
import { RoleBadge } from "@/components/portal/role-badge";
import theme from "@/components/portal/portal-theme.module.css";
import { useMockAuth } from "@/features/auth/mock-auth";
import { cn } from "@/lib/utils";
import { useUiText } from "@/lib/i18n/use-ui-text";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { NotificationPopover } from "@/components/layout/notification-popover";
import { ProfilePopover } from "@/components/layout/profile-popover";
import { getNavigation, type DesktopNavItem } from "@/lib/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PortalRole } from "@/types/navigation";
import { LiveIcon } from "@/components/motion/live-icon";

export function AppHeader({
  role,
  activeHref,
  profileName,
  profileDescription,
  avatarInitials,
  notificationHref,
}: {
  role: PortalRole;
  activeHref?: string;
  eyebrow?: string;
  description?: string;
  profileName?: string;
  profileDescription?: string;
  avatarInitials?: string;
  notificationHref?: string;
  unreadNotifications?: number;
}) {
  const tx = useUiText();
  const { session } = useMockAuth();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerId = useId();
  const items = getNavigation(role) as DesktopNavItem[];
  const filtered = items.filter((item) =>
    tx(item.label).toLowerCase().includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen(true);
        input.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    const outside = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", outside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", outside);
    };
  }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    const dialog = drawer.current;
    const opener = menuButton.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (desktop.matches) setDrawerOpen(false);
    };
    desktop.addEventListener("change", onResize);
    return () => {
      desktop.removeEventListener("change", onResize);
      dialog?.close();
      document.body.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);
  function handleDrawerKeys(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]):not([tabindex="-1"])',
      ),
    ].filter((node) => node.getClientRects().length);
    const first = controls[0],
      last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  return (
    <header
      className={`${theme.header} sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur`}
    >
      <div className="mx-auto flex h-16 min-w-0 items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            ref={menuButton}
            type="button"
            aria-label={tx("Open mobile navigation menu")}
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
            aria-haspopup="dialog"
            onClick={() => setDrawerOpen(true)}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">
            <BrandLogo compact />
          </div>
          <div className={theme.headerRole}>
            <RoleBadge role={role} />
          </div>
          <div ref={container} className="relative hidden min-w-0 sm:block">
            <label className="relative block">
              <span className="sr-only">{tx("Find a page")}</span>
              <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-400" />
              <input
                ref={input}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={tx("Find a page")}
                title={tx("Find a page (Ctrl+K)")}
                className="h-11 w-32 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs md:w-44 lg:w-44 xl:w-64"
              />
            </label>
            {searchOpen && (
              <nav
                aria-label={tx("Page search results")}
                className="absolute left-0 top-12 z-50 grid max-h-80 w-72 gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
              >
                <p className="px-3 py-2 text-xs text-muted-600">
                  {isBn
                    ? tx("আপনার account-এর পেজ")
                    : tx("Pages for your account")}
                </p>
                {filtered.length ? (
                  filtered.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-2 rounded-xl p-3 text-sm hover:bg-[var(--role-soft)]"
                    >
                      <LiveIcon
                        icon={item.icon}
                        className="size-4 text-[var(--role-ink)]"
                      />
                      {tx(item.label)}
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm">{tx("No pages found.")}</p>
                )}
              </nav>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitch touchFriendly />
          {notificationHref && (
            <NotificationPopover
              role={role}
              notificationHref={notificationHref}
            />
          )}
          <ProfilePopover
            role={role}
            profileName={profileName}
            profileDescription={profileDescription}
            avatarInitials={avatarInitials}
          />
        </div>
      </div>
      <div className={theme.mobileIdentity}>
        <RoleBadge role={role} />
        <span>{session?.displayName || profileName || tx("My account")}</span>
      </div>
      {drawerOpen &&
        createPortal(
          <dialog
            data-portal-role={role}
            ref={drawer}
            id={drawerId}
            aria-label={tx("Account navigation")}
            onKeyDown={handleDrawerKeys}
            onCancel={(event) => {
              event.preventDefault();
              setDrawerOpen(false);
            }}
            className={cn(
              theme.theme,
              "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0",
            )}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={tx("Close mobile navigation")}
              className="absolute inset-0"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="relative flex h-full w-[min(86vw,22rem)] flex-col bg-white p-4 shadow-xl pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <RoleBadge role={role} />
                <button
                  autoFocus
                  type="button"
                  aria-label={tx("Close navigation")}
                  onClick={() => setDrawerOpen(false)}
                  className="grid size-11 place-items-center rounded-xl hover:bg-slate-100"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="grid min-h-0 gap-1 overflow-y-auto overscroll-contain">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={item.href === activeHref ? "page" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={`${theme.drawerLink} flex items-center gap-3 rounded-xl border border-transparent p-3 text-sm font-semibold hover:bg-slate-50`}
                  >
                    <LiveIcon icon={item.icon} className="size-5 shrink-0" />
                    {tx(item.label)}
                  </Link>
                ))}
              </nav>
            </aside>
          </dialog>,
          document.body,
        )}
    </header>
  );
}
