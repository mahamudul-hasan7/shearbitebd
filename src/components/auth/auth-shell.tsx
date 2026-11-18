"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import styles from "./auth-pages.module.css";

interface AuthShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  artworkVariant?: "community" | "security" | "impact";
  backHref?: string;
  className?: string;
  contentClassName?: string;
}

export function AuthShell({
  children,
  title = "Share extra food. Help it reach people.",
  description = "Donors, NGOs and riders coordinate food collection and delivery through ShareBite BD.",
  backHref = ROUTES.home,
  className,
  contentClassName,
}: AuthShellProps) {
  const tx = useUiText();
  return (
    <main className={styles.page}>
      <div className={cn(styles.frame, className)}>
        <aside className={styles.artwork}>
          <Image
            src="/images/dhaka-cityscape-auth.jpg"
            alt=""
            fill
            sizes="40vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#062e23] to-[#062e23]/70" />
          <div className={styles.artworkContent}>
            <BrandLogo href={ROUTES.home} inverse />
            <h2>{tx(title)}</h2>
            <p>{tx(description)}</p>
            <ul>
              {[
                "Share food as a donor",
                "Collect meals for your NGO",
                "Deliver meals as a rider",
              ].map((text) => (
                <li key={text}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  {tx(text)}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className={styles.panel}>
          <header className={styles.header}>
            <BrandLogo href={ROUTES.home} className={styles.mobileBrand} />
            <Link href={backHref} className={styles.backLink}>
              <ArrowLeft size={17} aria-hidden="true" />
              {tx("Back to home")}
            </Link>
            <LanguageSwitch touchFriendly />
          </header>
          <div className={styles.content}>
            <div
              className={cn("mx-auto w-full", contentClassName ?? "max-w-lg")}
            >
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
