"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Leaf,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { adminNavigation } from "@/lib/navigation";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useMockAuth } from "@/features/auth/mock-auth";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import type { ReactNode } from "react";
import s from "./admin.module.css";

export function AdminShell({
  children,
  date,
}: {
  children: ReactNode;
  date: string;
}) {
  const tx = useUiText();
  const { language } = useLanguage();
  const { session, signOut } = useMockAuth();
  const pathname = usePathname();
  const current =
    adminNavigation.find((item) => pathname === item.href) ||
    adminNavigation[0];
  const nav = (mobile = false) => (
    <nav
      aria-label={tx(mobile ? "Mobile admin navigation" : "Admin navigation")}
      className={mobile ? s.mobileNav : s.nav}
    >
      {adminNavigation.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon size={20} />
          <span>{tx(label)}</span>
          {!mobile && <ArrowUpRight className={s.navArrow} size={16} />}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className={s.root}>
      <a href="#admin-content" className={s.skip}>
        {tx("Skip to content")}
      </a>
      <aside className={s.sidebar}>
        <Link href="/admin/dashboard" className={s.brand}>
          <span className={s.brandIcon}>
            <Leaf size={25} />
          </span>
          <span>
            ShareBite<span className={s.brandTag}>BD</span>
            <small>{tx("Admin workspace")}</small>
          </span>
        </Link>
        <p className={s.navLabel}>{tx("MANAGE")}</p>
        {nav()}
        <div className={s.sidebarFoot}>
          <div className={s.accessNote}>
            <ShieldCheck size={21} />
            <span>
              {tx("Administrator access")}
              <small>{tx("Decisions with accountability")}</small>
            </span>
          </div>
          <div className={s.identity}>
            <span className={s.avatar}>
              {session?.displayName?.slice(0, 1) || "A"}
            </span>
            <span>
              <strong>{session?.displayName || tx("Administrator")}</strong>
              <small>{tx("Administrator")}</small>
            </span>
            <button aria-label={tx("Log out")} onClick={() => void signOut()}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className={s.workspace}>
        <header className={s.header}>
          <span className={s.headerLabel}>
            <ShieldCheck size={17} />
            {tx("Operations workspace")}
          </span>
          <Link className={s.mobileBrand} href="/admin/dashboard">
            <Leaf size={22} />
            ShareBite <small>{tx("Admin")}</small>
          </Link>
          <div className={s.headerActions}>
            <LanguageSwitch touchFriendly />
            <span className={s.headerIdentity}>
              {session?.displayName || tx("Administrator")}
            </span>
            <button
              className={s.mobileLogout}
              aria-label={tx("Log out")}
              onClick={() => void signOut()}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main id="admin-content" className={s.main}>
          <div className={s.pageHeading}>
            <div>
              <p className={s.eyebrow}>
                {new Intl.DateTimeFormat(
                  language === "bn" ? "bn-BD" : "en-GB",
                  { dateStyle: "full", timeZone: "Asia/Dhaka" },
                ).format(new Date(date))}
              </p>
              <h1>{tx(current.label)}</h1>
              <p>
                {tx(
                  pathname.includes("verifications")
                    ? "Review new accounts and their verification documents."
                    : pathname.includes("users")
                      ? "Find users. Manage access with clear, recorded decisions."
                    : pathname.includes("rescues")
                      ? "Follow each rescue from pickup to distribution."
                      : pathname.includes("reports")
                        ? "Resolve concerns. Keep food safety first."
                        : "A clear view of what needs your attention.",
                )}
              </p>
            </div>
            <button
              className={s.refresh}
              aria-label={tx("Refresh workspace")}
              onClick={() =>
                window.dispatchEvent(new Event("sharebite:admin-refresh"))
              }
            >
              <RefreshCw size={17} />
              <span>{tx("Refresh")}</span>
            </button>
          </div>
          {children}
        </main>
      </div>
      {nav(true)}
    </div>
  );
}
