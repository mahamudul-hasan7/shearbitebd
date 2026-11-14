"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Bike, Building2, ChevronDown, HeartHandshake, KeyRound, Leaf, Menu, Utensils, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { ReviewTrainMarquee } from "./review-train-marquee";
import { HeroSloganLine, HeroStoryControls, HeroStoryMedia } from "./hero-story";
import { getRoleLandingRoute, useMockAuth } from "@/features/auth/mock-auth";
import { LiveIcon, LiveIconGroup } from "@/components/motion/live-icon";
import { useLanguage } from "@/lib/i18n/language-context";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { ROUTES } from "@/lib/routes";
import styles from "./mobile-home-view.module.css";

const roles = [
  { title: "Give extra food", label: "As a donor", action: "Join as a food donor", icon: Utensils, href: ROUTES.auth.registerDonor },
  { title: "Collect food", label: "As an NGO", action: "Join as an NGO", icon: Building2, href: ROUTES.auth.registerNgo },
  { title: "Deliver food", label: "As a rider", action: "Join as a rider", icon: Bike, href: ROUTES.auth.registerVolunteer },
];
const steps = [
  { title: "A donor shares a post", description: "Add the food quantity and pickup time." },
  { title: "An NGO arranges collection", description: "A rider takes the food from the donor to the NGO." },
  { title: "Meals reach people", description: "The NGO distributes the food and updates the record." },
];
const questions = [
  { question: "How can I get started?", answer: "Choose donor, NGO or rider and create an account. New NGO and rider accounts need approval from the project operator." },
  { question: "Who picks up the food?", answer: "After an NGO claims a post, a rider accepts the delivery and coordinates pickup with the donor." },
  { question: "Does the app check food quality?", answer: "The app records the donor's information and handovers. It does not independently test food quality or temperature." },
  { question: "Where can I see food posts?", answer: "Sign in with an NGO account to see the food listings available to your account. Food details are shared according to account permissions." },
];
const menuLinks = [
  { href: "#mobile-roles", label: "Choose how to help" },
  { href: "#mobile-process", label: "How sharing works" },
  { href: "#mobile-food", label: "Find food for your NGO" },
  { href: "#mobile-reviews", label: "Demo reviews" },
  { href: "#mobile-faq", label: "Common questions" },
];

export function MobileHomeView() {
  const tx = useUiText();
  const router = useRouter();
  const { language } = useLanguage();
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  const { session } = useMockAuth();
  const [menuState, setMenuState] = useState<"closed" | "open" | "closing">("closed");
  const menuOpen = menuState !== "closed";
  const dialog = useRef<HTMLDialogElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const menuBackdrop = useRef<HTMLButtonElement>(null);
  const menuAnimations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const accountHref = session ? getRoleLandingRoute(session.role) : ROUTES.auth.login;
  const primaryHref = session ? accountHref : ROUTES.auth.roleSelection;
  const primaryLabel = session ? "Continue to dashboard" : "Join ShareBite";
  const foodHref = session?.role === "NGO" ? ROUTES.ngo.discover : session ? ROUTES.auth.registerNgo : `${ROUTES.auth.login}?next=${encodeURIComponent(ROUTES.ngo.discover)}`;

  async function closeMenu() {
    const current = dialog.current;
    if (!current?.open || closing.current) return false;
    closing.current = true;
    setMenuState("closing");
    const panel = menuPanel.current;
    const backdrop = menuBackdrop.current;
    if (panel && backdrop && typeof panel.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Start from the visible position, including when closing during entry.
      const panelStyle = getComputedStyle(panel);
      const start = { opacity: panelStyle.opacity, transform: panelStyle.transform };
      const backdropOpacity = getComputedStyle(backdrop).opacity;
      menuAnimations.current.forEach((animation) => animation.cancel());
      const options: KeyframeAnimationOptions = { duration: 160, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" };
      const animations = [
        panel.animate([start, { opacity: 0, transform: "translateY(-10px) scale(.985)" }], options),
        backdrop.animate([{ opacity: backdropOpacity }, { opacity: 0 }], options),
      ];
      menuAnimations.current = animations;
      await Promise.allSettled(animations.map((animation) => animation.finished));
    }
    // Resize or unmount can already have closed this particular dialog.
    if (dialog.current !== current || !current.open) return false;
    current.close();
    setMenuState("closed");
    return true;
  }

  async function followMenuLink(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!await closeMenu()) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (href.startsWith("#")) {
      window.history.pushState(window.history.state, "", href);
      window.requestAnimationFrame(() => {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior, block: "start" });
      });
    } else if (href === ROUTES.home) {
      router.push(href, { scroll: false });
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior }));
    } else router.push(href);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const current = dialog.current;
    const opener = trigger.current;
    const previous = document.body.style.overflow;
    closing.current = false;
    current?.showModal();
    document.body.style.overflow = "hidden";
    const panel = menuPanel.current;
    const backdrop = menuBackdrop.current;
    if (panel && backdrop && typeof panel.animate === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      menuAnimations.current = [
        panel.animate([{ opacity: 0, transform: "translateY(-16px) scale(.98)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: 220, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }),
        backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out", fill: "both" }),
      ];
    }
    const wide = window.matchMedia("(min-width:1024px)");
    const closeOnDesktop = () => { if (wide.matches) setMenuState("closed"); };
    wide.addEventListener("change", closeOnDesktop);
    return () => {
      wide.removeEventListener("change", closeOnDesktop);
      menuAnimations.current.forEach((animation) => animation.cancel());
      menuAnimations.current = [];
      closing.current = false;
      current?.close();
      document.body.style.overflow = previous;
      opener?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  return <div className={styles.root} data-language={language} data-testid="mobile-landing">
    <header className={styles.header}>
      <BrandLogo className={styles.brand} />
      <div className={styles.headerActions}>
        <LanguageSwitch className={styles.language} touchFriendly />
        <button ref={trigger} type="button" className={styles.menuButton} aria-label={tx("Toggle Navigation Menu")} aria-expanded={menuState === "open"} aria-controls="mobile-home-menu" onClick={() => setMenuState("open")}><Menu size={22} aria-hidden="true" /></button>
      </div>
    </header>

    <main className={styles.main}>
      <section className={styles.hero} id="mobile-home" aria-labelledby="mobile-home-title">
        <HeroStoryMedia imageClassName={styles.heroImage} />
        <HeroStoryControls className={styles.heroControls} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}><Leaf size={15} aria-hidden="true" />{tx("Good food deserves another chance")}</p>
          <h1 id="mobile-home-title"><span>{tx("Share a meal.").replace(/[.।]+\s*$/u,"")}</span><HeroSloganLine>{tx("Make someone's day.")}</HeroSloganLine></h1>
          <p className={styles.intro}>{tx("Extra food can go further. Donors, NGOs and riders make it happen together.")}</p>
          <Link className={styles.heroAction} href={primaryHref}>{tx(primaryLabel)}<ArrowUpRight size={20} aria-hidden="true" /></Link>
        </div>
        <span className={styles.photoCredit}><HeartHandshake size={14} aria-hidden="true" />{tx("A little sharing goes a long way")}</span>
      </section>

      <section id="mobile-roles" className={`${styles.section} ${styles.rolesSection}`} aria-labelledby="mobile-roles-title">
        <h2 id="mobile-roles-title">{tx("Find your way to help")}</h2>
        <LiveIconGroup className={styles.roles}>{roles.map(({ title, label, action, icon: Icon, href }) => <Link href={href} className={styles.role} key={title} aria-label={tx(action)}>
          <LiveIcon icon={Icon} motion="ambient" size={26} strokeWidth={1.6} />
          <strong>{tx(title)}</strong><span>{tx(label)}</span><ArrowUpRight size={15} aria-hidden="true" />
        </Link>)}</LiveIconGroup>
        <div id="mobile-food" className={styles.foodAccess}>
          <p><Building2 size={16} aria-hidden="true" />{tx("Looking for food as an NGO?")}</p>
          <Link href={foodHref}>{tx(session?.role === "NGO" ? "Browse food posts" : session ? "Join as an NGO" : "NGO sign-in")}<ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </section>

      <section id="mobile-process" className={`${styles.section} ${styles.process}`} aria-labelledby="mobile-process-title">
        <p className={styles.kicker}>{tx("How sharing works")}</p>
        <h2 id="mobile-process-title">{tx("One meal. A shared effort.")}</h2>
        <ol className={styles.steps}>{steps.map((step, index) => <li key={step.title}>
          <span className={styles.stepNumber} aria-hidden="true">{(index + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}</span>
          <div><h3>{tx(step.title)}</h3><p>{tx(step.description)}</p></div>
        </li>)}</ol>
        <div id="mobile-features" className={styles.handover}><KeyRound size={20} aria-hidden="true" /><p><strong>{tx("A code for every handover")}</strong><span>{tx("Separate pickup and delivery codes keep each step confirmed.")}</span></p></div>
      </section>

      <section id="mobile-reviews" className={`${styles.section} ${styles.reviews}`} aria-labelledby="mobile-reviews-title">
        <p className={styles.kicker}>{tx("Demo reviews")}</p><h2 id="mobile-reviews-title">{tx("Stories of sharing")}</h2>
        <ReviewTrainMarquee lang={language} compact />
      </section>

      <section id="mobile-faq" className={`${styles.section} ${styles.faqSection}`} aria-labelledby="mobile-faq-title">
        <h2 id="mobile-faq-title">{tx("Before you get started")}</h2>
        <div className={styles.faq}>{questions.map(({ question, answer }) => <details key={question}>
          <summary>{tx(question)}<ChevronDown size={17} aria-hidden="true" /></summary><p>{tx(answer)}</p>
        </details>)}</div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div className={styles.footerJoin}><h2>{tx("A small step starts here.")}</h2><Link href={primaryHref}>{tx(primaryLabel)}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <div className={styles.footerBrand}><BrandLogo className={styles.brand} /><p>{tx("Less food waste. More shared meals.")}</p></div>
      <nav aria-label={tx("Footer navigation")}><a href="#mobile-process">{tx("How sharing works")}</a><a href="#mobile-faq">{tx("Common questions")}</a><Link href={accountHref}>{tx(session ? "My account" : "Sign in")}</Link></nav>
      <small>© 2026 ShareBite BD</small>
    </footer>

    {menuOpen && <dialog id="mobile-home-menu" ref={dialog} className={styles.dialog} data-state={menuState} aria-label={tx("Navigation menu")} onCancel={(event) => { event.preventDefault(); void closeMenu(); }}>
      <button ref={menuBackdrop} type="button" className={styles.backdrop} tabIndex={-1} aria-label={tx("Close menu")} onClick={() => { void closeMenu(); }} />
      <div ref={menuPanel} className={styles.menuPanel}><div className={styles.menuHeading}><BrandLogo className={styles.brand} onClick={(event) => { void followMenuLink(event, ROUTES.home); }} /><button type="button" className={styles.menuButton} aria-label={tx("Close menu")} onClick={() => { void closeMenu(); }} autoFocus><X size={21} /></button></div>
        <nav>{menuLinks.map((link) => <a key={link.href} href={link.href} onClick={(event) => { void followMenuLink(event, link.href); }}>{tx(link.label)}<ArrowRight size={16} aria-hidden="true" /></a>)}</nav>
        <Link className={styles.menuAccount} href={accountHref} onClick={(event) => { void followMenuLink(event, accountHref); }}>{tx(session ? "My account" : "Sign in")}<ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </dialog>}
  </div>;
}
