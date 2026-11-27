"use client";
import { LiveIcon, LiveIconGroup } from "@/components/motion/live-icon";
import mobile from "./home-mobile.module.css";
import responsive from "./home-responsive.module.css";
import { DesktopHero } from "./desktop-hero";
import { MobileHomeView } from "./mobile-home-view";
import { HeroStoryProvider } from "./hero-story";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { localizeUiCopy } from "@/lib/i18n/ui-text";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Bike,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  KeyRound,
  Menu,
  QrCode,
  ShieldCheck,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ReviewTrainMarquee } from "@/components/home/review-train-marquee";
import { getRoleLandingRoute, useMockAuth } from "@/features/auth/mock-auth";
import { UserRole } from "@/lib/constants/roles";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const copy = {
  bn: {
    nav: {
      home: "হোম",
      howItWorks: "উদ্ধার প্রক্রিয়া",
      safety: "খাদ্য নিরাপত্তা",
      impact: "কমিউনিটি ইমপ্যাক্ট",
      faq: "সাধারণ জিজ্ঞাসা",
      partners: "এনজিও ও পার্টনার্স",
      login: "লগইন করুন",
      join: "যুক্ত হোন",
      donorPortal: "ডোনার পোর্টাল",
      ngoPortal: "এনজিও পোর্টাল",
      volunteerPortal: "ভলান্টিয়ার কমান্ড",
      closeMenu: "মেনু বন্ধ করুন",
    },
    hero: {
      badge: "স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক · বাংলাদেশ",
      titlePart1: "বাড়তি খাবার ভাগ করে দিন,",
      titleHighlight: "কারও একবেলার ভরসা হোন।",
      subtitle:
        "ঢাকাসহ সারাদেশে বিশ্ববিদ্যালয় ক্যাফেটেরিয়া (UIU, BRACU), কমিউনিটি সেন্টারের মেজবান এবং রেস্তোরাঁর তাজা উদ্বৃত্ত খাবার পৌঁছে যাচ্ছে বিদ্যানন্দ, মাস্তুল ফাউন্ডেশন সহ নিবন্ধিত দাতব্য সংস্থায়—রিয়েল-টাইম ট্র্যাকিং ও কিউআর ভেরিফিকেশনের মাধ্যমে।",
      searchPlaceholder: "এলাকা দিন (যেমন: গুলশান, ধানমন্ডি, বাড্ডা...)",
      searchBtn: "খাবার অনুসন্ধান ও ক্লেইম",
      popularLabel: "জনপ্রিয় জোন:",
      popularZones: "গুলশান ১ ও ২ · ধানমন্ডি ২৭ · বাড্ডা UIU ক্যাম্পাস",
      urgentTag: "১৫ মিনিটে জরুরি রেসকিউ",
      demoLabel: "সরাসরি ডেমো পোর্টাল:",
      donorDemo: "ফুড ডোনার ড্যাশবোর্ড",
      ngoDemo: "এনজিও ড্যাশবোর্ড",
      volunteerDemo: "ভলান্টিয়ার কমান্ড হাব",
      stat1Val: "৪,৩৪০+",
      stat1Lbl: "আজকের উদ্ধারকৃত মিল",
      stat2Val: "৬২+",
      stat2Lbl: "সক্রিয় অংশীদার",
      stat3Val: "৮টি",
      stat3Lbl: "বিভাগীয় জোন",
    },
    bento: {
      badge: "উদ্ধার প্রক্রিয়া",
      title: "প্রতিটি খাবার পৌঁছাবে সঠিক মানুষের কাছে",
      subtitle:
        "কনভেনশন সেন্টার ও ক্যাফেটেরিয়ার অতিরিক্ত খাবার নষ্ট না করে নিরাপদ প্যাকেজিংয়ে মানুষের কাছে পৌঁছে দেওয়ার ডিজিটাল নেটওয়ার্ক।",
      card1Tag: "০১ · দাতা",
      card1Title: "নিরাপদ খাবার পোস্ট",
      card1Desc:
        "হোটেল, কনভেনশন বা ক্যাফেটেরিয়া অনুষ্ঠান শেষে অতিরিক্ত খাবারের ছবি ও আনুমানিক মিল সংখ্যাসহ তাৎক্ষণিক পোস্ট করতে পারে।",
      card1Meta: "ছবি, পরিমাণ ও পিকআপ সময়",
      card2Tag: "০২ · কিউআর ও ওটিপি",
      card2Title: "স্মার্ট কিউআর ভেরিফিকেশন",
      card2Desc:
        "ডোনার ও রিসিভার উভয়েই কিউআর কোড স্ক্যানের মাধ্যমে খাবারের গুণগত মান যাচাই ও ডিজিটাল হস্তান্তর নিশ্চিত করেন।",
      card2Meta: "৬-অঙ্কের নিরাপদ হস্তান্তর কোড",
      card3Tag: "০৩ · দ্রুত ডেলিভারি",
      card3Title: "৬০ মিনিটে কোল্ড-চেইন বিতরণ",
      card3Desc:
        "খাবার রান্নার সময় অনুযায়ী নিরাপদ ব্যবহারের মেয়াদ স্বয়ংক্রিয়ভাবে ট্র্যাক হয় এবং দ্রুততম ভলান্টিয়ারের কাছে অ্যালার্ট যায়।",
      card3Meta: "লাইভ রুট ও সময়সীমা অ্যালার্ট",
    },
    standards: {
      badge: "খাদ্য নিরাপত্তা",
      title: "বাণিজ্যিক মানের খাদ্য নিরাপত্তা ও সিলড প্যাকেজিং",
      subtitle:
        "আমরা নিশ্চিত করি প্রতিটি খাবার সর্বোচ্চ পুষ্টিগুণ, স্বাস্থ্যসম্মত মর্যাদা এবং নিরাপদ প্যাকেজিং বজায় রেখে বিতরণ করা হচ্ছে।",
      photoBadge: "BFSA মানদণ্ড · ৬০°C+ সংরক্ষণ",
      photoTag: "১০০% সিলড প্যাকেজিং",
      card1Badge: "হাইজিন সিল প্রোটোকল",
      card1Title: "ফুড-গ্রেড বক্সে নিরাপদ সিল",
      card1Desc:
        "কাচ্চি বিরিয়ানি, পোলাও ও সবজি তাজা অবস্থায় ইনসুলেটেড কন্টেইনারে সিল করা হয় যাতে কোনো ধরনের দূষণ না ঘটে।",
      card2Badge: "থার্মাল ইন্টিগ্রিটি",
      card2Title: "গরম ও কোল্ড চেইন মনিটরিং",
      card2Desc:
        "গরম খাবার ৬০°C-এর উপরে রাখা হয় এবং তাপমাত্রা-নিয়ন্ত্রিত ব্যাগে দ্রুত ভলান্টিয়ার দ্বারা পরিবহন করা হয়।",
      card3Badge: "ট্রেসেবিলিটি ও সিএসআর",
      card3Title: "সার্টিফাইড ইমপ্যাক্ট অডিট",
      card3Desc:
        "অংশগ্রহণকারী রেস্তোরাঁ ও বিশ্ববিদ্যালয়গুলো খাদ্য অপচয় রোধ ও কার্বন হ্রাসের ডিজিটাল ভেরিফাইড সনদপত্র পায়।",
    },
    stories: {
      badge: "কমিউনিটি ইমপ্যাক্ট ও মানবিক গল্প",
      title: "প্রতিটি প্লেটের পেছনে এক একটি মর্যাদার গল্প",
      subtitle:
        "খাদ্য অপচয় রোধ কেবল পরিবেশ সংরক্ষণ নয়, এটি অভাবী মানুষের পাশে দাঁড়ানোর একটি অনন্য মানবিক প্রয়াস।",
      story1Quote:
        "“আমাদের বিশ্ববিদ্যালয়ের ক্যাফেটেরিয়ায় প্রতিদিন মেহমান ও শিক্ষার্থীদের খাবারের পর যে ফ্রেশ বিরিয়ানি ও কারি বেঁচে যেত, তা এখন মাত্র ২০ মিনিটের মধ্যে মাস্তুল সেন্টারে পৌঁছে যায়।”",
      story1Author: "আসিফ ইকবাল",
      story1Role: "ক্যাফেটেরিয়া সুপারভাইজার, UIU",
      story2Quote:
        "“শিশুরা যখন গরম কাচ্চি বা রোস্টের প্যাকেট পায়, তাদের মুখের সেই উজ্জ্বল হাসি ভাষায় প্রকাশ করা যায় না। ডিজিটাল ওটিপি সিস্টেমের কারণে সবকিছু অত্যন্ত স্বচ্ছ।”",
      story2Author: "ফারহানা আক্তার",
      story2Role: "শেল্টার কো-অর্ডিনেটর, মাস্তুল ফাউন্ডেশন",
      story3Quote:
        "“বাইক নিয়ে হাতিরঝিল দিয়ে খাবার পৌঁছে দেওয়ার প্রতিটি মুহূর্তে মনে হয় আমি একটি মহৎ দায়িত্ব পালন করছি। শেয়ারবাইট প্ল্যাটফর্মের রুট গাইড সত্যিই দারুণ।”",
      story3Author: "তানভীর আহমেদ",
      story3Role: "স্বেচ্ছাসেবক রাইডার, ঢাকা মেট্রো স্কোয়াড",
    },
    faq: {
      badge: "সাধারণ জিজ্ঞাসা",
      title: "সচরাচর জিজ্ঞাসিত প্রশ্ন ও উত্তর",
      subtitle: "ShareBite BD খাদ্য সুরক্ষা প্ল্যাটফর্মের কার্যক্রম ও নিরাপত্তা সম্পর্কিত কিছু জরুরি তথ্যাবলি।",
      items: [
        {
          q: "ShareBite BD প্ল্যাটফর্মে অতিরিক্ত খাবার দিতে কি কোনো ফি বা খরচ দিতে হয়?",
          a: "না, ShareBite BD সম্পূর্ণ সামাজিক ও সিভিক-টেক উদ্যোগ। ক্যাফেটেরিয়া বা রেস্তোরাঁর উদ্বৃত্ত খাবার পোস্ট করা এবং নিবন্ধিত এনজিওদের মাধ্যমে তা সংগ্রহ ও বিতরণ করা সম্পূর্ণ বিনামূল্যে সম্পন্ন হয়।",
        },
        {
          q: "খাবারের গুণগত মান এবং স্বাস্থ্যসম্মত হাইজিন কীভাবে নিশ্চিত করা হয়?",
          a: "প্রতিটি খাবার রান্নার সময় থেকে স্বয়ংক্রিয় ডিজিটাল নিরাপদ মেয়াদ (Safe Consumption Window) ট্র্যাক করা হয়। বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA)-এর মানদণ্ড অনুযায়ী সিলযুক্ত ফুড-গ্রেড বক্সে তাপমাত্রা নিয়ন্ত্রণ (হট ফুড ৬০°C+ এবং কোল্ড চেইন ৪°C-) বজায় রেখে দ্রুততম সময়ে সরবরাহ করা হয়।",
        },
        {
          q: "উদ্বৃত্ত খাবার কে নিয়ে যাবে এবং কারা বিতরণ করবে?",
          a: "খাবার পোস্ট হওয়ার সাথে সাথে নিকটবর্তী নিবন্ধিত দাতব্য সংস্থা (যেমন: বিদ্যানন্দ, মাস্তুল ফাউন্ডেশন) এবং স্থানীয় ভলান্টিয়ার রাইডারদের কাছে রিয়েল-টাইম জিপিএস অ্যালার্ট পৌঁছায়। তারা নিজস্ব পরিবহন বা রাইডারের মাধ্যমে উপস্থিত হয়ে ডিজিটাল ওটিপি ও কিউআর কোড স্ক্যান করে খাবার বুঝে নেয়।",
        },
        {
          q: "যেকোনো ব্যক্তি বা সংস্থা কি এনজিও হিসেবে খাবার দাবি করতে পারে?",
          a: "না। কেবল সমাজসেবা অধিদপ্তর বা এনজিও বিষয়ক ব্যুরো থেকে সরকারিভাবে নিবন্ধিত এবং ShareBite দ্বারা অডিটকৃত যাচাইকৃত দাতব্য সংস্থাই খাদ্য দাবি বা বণ্টনের দায়িত্ব নিতে পারে।",
        },
        {
          q: "খাবার হস্তান্তরের সময় কোনো ডিজিটাল প্রমাণপত্র পাওয়া যায় কি?",
          a: "হ্যাঁ, প্রতিটি হস্তান্তরের জন্য উভয় পক্ষের কিউআর ভেরিফিকেশন ও ট্র্যাকিং আইডি জেনারেট হয়। দাতা প্রতিষ্ঠানগুলো সিএসআর (CSR) এবং গ্রিন-অডিট হিসেবে ডিজিটাল খাদ্য সুরক্ষা সার্টিফিকেট সংগ্রহ করতে পারে।",
        },
      ],
    },
    partnersTitle: "দেশসেরা ক্যাফেটেরিয়া, ক্যাটারার্স ও চ্যারিটি নেটওয়ার্ক দ্বারা বিশ্বস্ত",
    partnersList: [
      "UIU Cafeteria",
      "মাস্তুল ফাউন্ডেশন",
      "বিদ্যানন্দ ফাউন্ডেশন",
      "জাগো ফাউন্ডেশন",
      "গুলশান ক্লাব",
      "র‌্যাডিসন ব্লু ঢাকা",
    ],
    cta: {
      title: "আজ কি আপনার ক্যাফেটেরিয়া বা অনুষ্ঠানে খাবার উদ্বৃত্ত রয়েছে?",
      desc: "ShareBite BD নেটওয়ার্কে মাত্র ২ মিনিটে উদ্বৃত্ত খাবার পোস্ট করুন। আপনার কাছাকাছি নিবন্ধিত এনজিওরা এসে সম্মানের সাথে তা সংগ্রহ করে পৌঁছে দেবে।",
      donorBtn: "খাদ্য দাতা হিসেবে যুক্ত হোন",
      ngoBtn: "নিবন্ধিত এনজিও হিসেবে আবেদন করুন",
    },
    footer: {
      copyright: "© ২০২৬ ShareBite BD. জাতীয় স্মার্ট উদ্বৃত্ত খাদ্য উদ্ধার ও বণ্টন নেটওয়ার্ক।",
      helpline: "জরুরি সাপোর্ট হেল্পলাইন: ০৯৬১২-০৯৬১০০ (সকাল ৯টা - রাত ১১টা)",
    },
  },
  en: {
    nav: {
      home: "Home",
      howItWorks: "Rescue Process",
      safety: "Food Safety",
      impact: "Community Impact",
      faq: "FAQ",
      partners: "NGOs & Partners",
      login: "Sign In",
      join: "Join Network",
      donorPortal: "Donor Portal",
      ngoPortal: "NGO Portal",
      volunteerPortal: "Volunteer Command",
      closeMenu: "Close Menu",
    },
    hero: {
      badge: "Smart Surplus Food Rescue Network · Bangladesh",
      titlePart1: "Share your extra food,",
      titleHighlight: "help someone have a meal.",
      subtitle:
        "Across Dhaka and Bangladesh, fresh surplus food from university cafeterias (UIU, BRACU), wedding catering, and premier restaurants reaches verified charities like Bidyanondo and Mastul Foundation—via real-time tracking and verified QR handovers.",
      searchPlaceholder: "Enter area (e.g. Gulshan, Dhanmondi, Badda...)",
      searchBtn: "Search & Claim Meals",
      popularLabel: "Popular Zones:",
      popularZones: "Gulshan 1 & 2 · Dhanmondi 27 · Badda UIU Campus",
      urgentTag: "15-Minute Rapid Rescue",
      demoLabel: "Direct Demo Portals:",
      donorDemo: "Food Donor Dashboard",
      ngoDemo: "NGO Dashboard",
      volunteerDemo: "Volunteer Command Hub",
      stat1Val: "4,340+",
      stat1Lbl: "Meals Rescued Today",
      stat2Val: "62+",
      stat2Lbl: "Active Partners",
      stat3Val: "8",
      stat3Lbl: "Divisional Zones",
    },
    bento: {
      badge: "Rescue Process",
      title: "Every meal reaches the right people safely",
      subtitle:
        "A digital network ensuring extra food from convention centers and cafeterias is hygienically packaged and delivered to those in need.",
      card1Tag: "01 · DONOR",
      card1Title: "Post Safe Extra Food",
      card1Desc:
        "Hotels, conventions, or cafeterias can instantly post extra food with photos and estimated portions right after events.",
      card1Meta: "Photos, portions & pickup window",
      card2Tag: "02 · QR + OTP",
      card2Title: "Smart QR Verification",
      card2Desc:
        "Both donors and receivers verify food quality and complete authenticated digital handovers via QR code scans.",
      card2Meta: "6-digit confirmed handover codes",
      card3Tag: "03 · DISPATCH",
      card3Title: "60-Minute Cold-Chain Delivery",
      card3Desc:
        "Safe consumption windows are tracked automatically based on cooking timestamps, instantly alerting the nearest volunteers.",
      card3Meta: "Live route & shelf-life alerts",
    },
    standards: {
      badge: "Food Safety",
      title: "Commercial Food-Grade Safety & Sealed Packaging",
      subtitle:
        "We ensure all donated meals maintain peak nutritional quality, hygienic dignity, and secure food-grade packaging throughout delivery.",
      photoBadge: "BFSA Standard · 60°C+ Hold",
      photoTag: "100% Sealed Containers",
      card1Badge: "Hygiene Seal Protocol",
      card1Title: "Sealed Food-Grade Containers",
      card1Desc:
        "Kacchi Biryani, Polao, and fresh dishes are sealed in insulated containers to prevent any contamination.",
      card2Badge: "Thermal Integrity",
      card2Title: "Hot & Cold Chain Monitoring",
      card2Desc:
        "Hot food is kept above 60°C and transported swiftly by volunteers in temperature-controlled bags.",
      card3Badge: "Traceability & CSR",
      card3Title: "Certified Impact Audit",
      card3Desc:
        "Participating restaurants and universities receive digital verified certificates for food waste diversion and carbon reduction.",
    },
    stories: {
      badge: "Community Impact & Human Stories",
      title: "Behind Every Plate Lies a Story of Dignity",
      subtitle:
        "Preventing food waste is not just environmental protection—it is a profound humanitarian effort to stand beside people in need.",
      story1Quote:
        "“The fresh biryani and curries left after guests and students dine at our university cafeteria now reach Mastul Center in just 20 minutes.”",
      story1Author: "Asif Iqbal",
      story1Role: "Cafeteria Supervisor, UIU",
      story2Quote:
        "“When children receive hot packs of kacchi or roast, the bright smiles on their faces are beyond words. The digital OTP system makes everything completely transparent.”",
      story2Author: "Farhana Akter",
      story2Role: "Shelter Coordinator, Mastul Foundation",
      story3Quote:
        "“Every time I ride across Hatirjheel delivering food, I feel I am fulfilling a noble mission. ShareBite's route navigation is truly remarkable.”",
      story3Author: "Tanvir Ahmed",
      story3Role: "Volunteer Rider, Dhaka Metro Squad",
    },
    faq: {
      badge: "Frequently Asked Questions",
      title: "Common Questions & Answers",
      subtitle: "Essential details regarding how ShareBite BD operates, food safety protocols, and governance.",
      items: [
        {
          q: "Are there any fees or charges to donate surplus food on ShareBite BD?",
          a: "No. ShareBite BD is an entirely non-profit civic tech platform. Posting surplus food and coordinating rescue with certified NGOs is completely free of charge.",
        },
        {
          q: "How is food safety and hygienic compliance guaranteed?",
          a: "Every batch is tracked with an automated Safe Consumption Window from the time of preparation. Deliveries strictly enforce insulated food-grade containers, keeping hot food above 60°C and chilled items below 4°C per BFSA standards.",
        },
        {
          q: "Who collects the food and handles the distribution?",
          a: "As soon as food is posted, real-time GPS alerts are broadcast to nearby verified charities (such as Mastul Foundation, Bidyanondo) and volunteer squads, who arrive and complete handovers via digital OTP and QR scanning.",
        },
        {
          q: "Can any organization claim food as an NGO?",
          a: "No. Only charities and welfare foundations officially registered with the Department of Social Services or NGO Affairs Bureau and verified by ShareBite admins are authorized to claim meals.",
        },
        {
          q: "Do food donors receive proof or CSR recognition for donations?",
          a: "Yes. Every verified handover issues a cryptographic digital receipt, allowing universities and caterers to audit their food waste diversion and receive CSR carbon-reduction certificates.",
        },
      ],
    },
    partnersTitle: "Trusted by the nation's premier cafeterias, caterers & charity networks",
    partnersList: [
      "UIU Cafeteria",
      "Mastul Foundation",
      "Bidyanondo Foundation",
      "JAAGO Foundation",
      "Gulshan Club",
      "Radisson Blu Dhaka",
    ],
    cta: {
      title: "Do you have surplus food at your cafeteria or event today?",
      desc: "Post surplus food on ShareBite BD in just 2 minutes. Registered NGOs near you will respectfully collect and deliver it.",
      donorBtn: "Join as Food Donor",
      ngoBtn: "Apply as Registered NGO",
    },
    footer: {
      copyright: "© 2026 ShareBite BD. National Smart Surplus Food Rescue & Redistribution Network.",
      helpline: "Emergency Helpline: 09612-096100 (9 AM - 11 PM)",
    },
  },
};

export function HomeView() {
  const tx = useUiText();
  const { session } = useMockAuth();
  const primaryHref = session ? getRoleLandingRoute(session.role) : ROUTES.auth.roleSelection;
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [activeNav, setActiveNav] = useState<string>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const scrollLockUntilRef = useRef(0);
  const [navIndicator, setNavIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false,
  });

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isBn = lang === "bn";
  const t = localizeUiCopy(copy[lang], lang);

  const measureNavIndicator = useCallback(() => {
    const navEl = navRef.current;
    const activeEl = navLinkRefs.current[activeNav];
    if (!navEl || !activeEl || activeEl.offsetWidth === 0) return;

    const nextLeft = activeEl.offsetLeft;
    const nextWidth = activeEl.offsetWidth;
    setNavIndicator((prev) =>
      prev.ready && prev.left === nextLeft && prev.width === nextWidth
        ? prev
        : { left: nextLeft, width: nextWidth, ready: true },
    );
  }, [activeNav]);

  useLayoutEffect(() => {
    measureNavIndicator();
  }, [measureNavIndicator, lang]);

  useEffect(() => {
    const navEl = navRef.current;
    if (!navEl) return;

    let cancelled = false;
    const handleResize = () => measureNavIndicator();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    observer?.observe(navEl);
    window.addEventListener("resize", handleResize);
    document.fonts?.ready.then(() => {
      if (!cancelled) measureNavIndicator();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [measureNavIndicator]);

  useEffect(() => {
    const orderedIds = ["hero", "how-it-works", "standards", "impact", "faq"];
    let frameId = 0;

    const updateOnScroll = () => {
      frameId = 0;
      const scrollY = window.scrollY;
      // Hysteresis prevents rapid scroll threshold oscillation near top of page.
      setIsScrolled((prev) => (prev ? scrollY >= 12 : scrollY > 36));

      if (window.innerWidth < 1024) return;
      if (performance.now() < scrollLockUntilRef.current) return;

      if (scrollY < 140) {
        setActiveNav((prev) => (prev === "hero" ? prev : "hero"));
        return;
      }

      const nearBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 48;
      if (nearBottom) {
        setActiveNav((prev) => (prev === "faq" ? prev : "faq"));
        return;
      }

      const probeY = scrollY + 140;
      let resolved = "hero";
      for (let i = orderedIds.length - 1; i >= 0; i -= 1) {
        const el = document.getElementById(orderedIds[i]);
        if (el && probeY >= el.offsetTop) {
          resolved = orderedIds[i];
          break;
        }
      }
      setActiveNav((prev) => (prev === resolved ? prev : resolved));
    };

    const scheduleUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateOnScroll);
      }
    };

    const releaseScrollLock = () => {
      scrollLockUntilRef.current = 0;
    };

    updateOnScroll();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("wheel", releaseScrollLock, { passive: true });
    window.addEventListener("touchstart", releaseScrollLock, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("wheel", releaseScrollLock);
      window.removeEventListener("touchstart", releaseScrollLock);
    };
  }, []);

  const navLinks = [
    { id: "hero", label: t.nav.home, href: "#hero" },
    { id: "how-it-works", label: t.nav.howItWorks, href: "#how-it-works" },
    { id: "standards", label: t.nav.safety, href: "#standards" },
    { id: "impact", label: t.nav.impact, href: "#impact" },
    { id: "faq", label: t.nav.faq, href: "#faq" },
  ];

  const handleNavClick = (id: string, href: string) => {
    scrollLockUntilRef.current = performance.now() + 900;
    setActiveNav(id);
    setIsMobileMenuOpen(false);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      const headerOffset = 72;
      const targetTop = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset);
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <HeroStoryProvider><MobileHomeView /><div className={cn("min-h-screen bg-[#f6fbf8] text-ink-900 selection:bg-emerald-100 selection:text-emerald-900 antialiased", mobile.page, responsive.desktop)}>
      {/* 1. Clean Airy Sticky Navbar */}
      <header
        data-scrolled={isScrolled}
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          isScrolled
            ? "border-b border-emerald-100/90 bg-white/95 backdrop-blur-xl shadow-[0_10px_28px_-14px_rgba(2,44,34,0.12)]"
            : "border-b border-emerald-100/70 bg-white/92 backdrop-blur-md shadow-none",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 xl:px-8 h-16 sm:h-[72px]", mobile.headerRow,
          )}
        >
          <div className={cn("flex shrink-0 items-center", mobile.logo)}>
            <BrandLogo variant="classic" />
          </div>

          {/* Desktop Navigation Links (Constant font weight + sliding underline indicator) */}
          <nav ref={navRef} className="relative hidden items-center gap-1 xl:gap-4 lg:flex">
            <span
              aria-hidden="true"
              style={{
                transform: `translate3d(${navIndicator.left}px, 0, 0)`,
                width: `${navIndicator.width}px`,
                opacity: navIndicator.ready ? 1 : 0,
                transition:
                  "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
              }}
              className="pointer-events-none absolute inset-y-0 left-0 z-0 will-change-transform"
            >
              <span className="absolute inset-x-2.5 xl:inset-x-3.5 bottom-0.5 h-[2.5px] rounded-full bg-[#047857]" />
            </span>
            {navLinks.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  ref={(el) => {
                    navLinkRefs.current[item.id] = el;
                  }}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.href);
                  }}
                  className={cn(
                    "relative z-10 px-2.5 xl:px-3.5 py-2 text-[13px] xl:text-[14.5px] font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer select-none",
                    isActive
                      ? "text-[#065f46]"
                      : "text-slate-600 hover:text-[#047857]",
                  )}
                >
                  {item.label}
                  {isActive && !navIndicator.ready && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2.5 xl:inset-x-3.5 bottom-0.5 h-[2.5px] rounded-full bg-[#047857]"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Crisp Pill Language Switcher */}
            <div
              className={cn(
                "relative grid grid-cols-2 items-center p-0.5 rounded-full border border-slate-200/90 bg-slate-50/90 text-xs xl:text-[13px] font-semibold select-none h-9 xl:h-10",
                mobile.language,
              )}
            >
              <span
                aria-hidden="true"
                style={{
                  transform: lang === "bn" ? "translate3d(100%, 0, 0)" : "translate3d(0, 0, 0)",
                  transition: "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                className="pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-full bg-white shadow-xs ring-1 ring-emerald-200/70 will-change-transform"
              />
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={cn(
                  "relative z-10 cursor-pointer rounded-full text-[11px] xl:text-[12.5px] font-bold transition-colors duration-200 leading-none px-2.5 xl:px-3.5 py-1.5 text-center",
                  lang === "en" ? "text-[#047857]" : "text-slate-500 hover:text-slate-900",
                )}
              ><UiText source={"EN"} /></button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                aria-pressed={lang === "bn"}
                className={cn(
                  "relative z-10 cursor-pointer rounded-full text-[11px] xl:text-[12.5px] font-bold transition-colors duration-200 leading-none px-2.5 xl:px-3.5 py-1.5 text-center",
                  lang === "bn" ? "text-[#047857]" : "text-slate-500 hover:text-slate-900",
                )}
              >
                {tx("বাংলা")}</button>
            </div>

            {!session && (
              <Link
                href={ROUTES.auth.login}
                className="hidden sm:inline-flex items-center rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap text-[#022c22] hover:text-[#047857] bg-white hover:bg-emerald-50/60 border border-slate-200/90 transition-all duration-200 px-4 xl:px-5 h-9 xl:h-10 shadow-2xs active:scale-95 touch-manipulation cursor-pointer"
              >
                {t.nav.login}
              </Link>
            )}

            <Link
              href={primaryHref}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#065f46] hover:bg-[#047857] text-xs xl:text-sm font-semibold whitespace-nowrap text-white shadow-[0_8px_20px_-8px_rgba(6,95,70,0.52)] transition-all duration-200 active:scale-95 h-9 xl:h-10 px-4 xl:px-5"
            >
              <span>{session ? tx("Continue to dashboard") : t.nav.join}</span>
              <ArrowRight className="size-3.5 xl:size-4" />
            </Link>

            {/* Mobile Hamburger Menu Button - Prominent, never pushed off-screen */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={cn(
                "grid place-items-center rounded-xl border border-slate-300/80 bg-white text-slate-800 shadow-xs lg:hidden hover:bg-slate-50 active:scale-90 cursor-pointer transition-all duration-200 touch-manipulation shrink-0",
                isScrolled ? "size-9" : "size-9.5", mobile.menu,
              )}
              aria-label={tx("Toggle Navigation Menu")}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="size-5.5 text-emerald-800" /> : <Menu className="size-5.5 text-slate-900" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className={cn("border-t border-slate-200/60 bg-white/98 backdrop-blur-2xl px-4 py-5 shadow-2xl lg:hidden animate-in slide-in-from-top duration-200 overflow-y-auto overscroll-contain touch-pan-y", isScrolled ? "max-h-[calc(100dvh-3.75rem)]" : "max-h-[calc(100dvh-4.75rem)] sm:max-h-[calc(100dvh-5.25rem)]")}>
            <nav className="grid gap-1.5">
              {navLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.href);
                  }}
                  className={`rounded-xl px-3.5 py-3 text-sm font-heading font-bold transition-all select-none touch-manipulation active:scale-98 ${
                    activeNav === item.id
                      ? "bg-emerald-50 text-emerald-800 font-black border border-emerald-200/60 shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4 space-y-2.5">
              <a
                href={ROUTES.auth.login}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md font-heading active:scale-98 cursor-pointer touch-manipulation"
              >
                <span className="inline-flex items-center gap-2"><KeyRound className="size-4" />{t.nav.login} {" "}{tx("করুন (ড্যাশবোর্ড)")}</span>
                <ArrowRight className="size-4" />
              </a>

              {/* 1-Tap Direct Role Portal Access */}
              <div className="grid grid-cols-3 gap-1.5">
                <Link
                  href="/login?next=/donor/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50/80 p-2 text-center text-[11px] font-bold text-emerald-900 active:scale-95"
                >
                  <Utensils className="size-4 text-emerald-700" />
                  <span>{tx("ডোনার")}</span>
                </Link>
                <Link
                  href="/login?next=/ngo/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-teal-100 bg-teal-50/80 p-2 text-center text-[11px] font-bold text-teal-900 active:scale-95"
                >
                  <Building2 className="size-4 text-teal-700" />
                  <span>{tx("এনজিও")}</span>
                </Link>
                <Link
                  href="/login?next=/volunteer/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-100 bg-amber-50/80 p-2 text-center text-[11px] font-bold text-amber-900 active:scale-95"
                >
                  <Bike className="size-4 text-amber-700" />
                  <span>{tx("ভলান্টিয়ার")}</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={ROUTES.auth.roleSelection}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 font-heading active:scale-98 touch-manipulation"
                >
                  {t.nav.join}
                </Link>
                <a
                  href="#faq"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-3 text-xs font-bold text-emerald-800 font-heading active:scale-98 shadow-xs touch-manipulation"
                >
                  {isBn ? tx("সাধারণ জিজ্ঞাসা") : tx("Project help")}
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with Background Image & Intact Right Column */}
      {/* 2. Clean Light-Emerald Sunlit Hero Section */}
      <DesktopHero
        language={lang}
        isLoggedIn={Boolean(session)}
        dashboardHref={primaryHref}
      />

      {/* 3. Architectural Editorial Showcase: How Rescue Works */}
      <section
        id="how-it-works"
        className="border-b border-emerald-100/70 bg-[radial-gradient(680px_380px_at_12%_10%,rgba(16,185,129,0.09),transparent_68%),radial-gradient(560px_340px_at_88%_18%,rgba(13,148,136,0.08),transparent_68%),linear-gradient(180deg,#f2faf6_0%,#f7fbf9_100%)] pt-14 pb-16 sm:pt-16 sm:pb-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/95 px-3.5 py-1 text-xs font-bold tracking-wide text-emerald-800 shadow-2xs">
              <Sparkles className="size-3.5 text-emerald-600" aria-hidden="true" />
              <span>{t.bento.badge}</span>
            </span>
            <h2 className="mt-3.5 font-heading text-2xl font-black tracking-tight text-[#022c22] sm:text-4xl">
              {t.bento.title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {t.bento.subtitle}
            </p>
          </div>

          <LiveIconGroup className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {[
              {
                icon: Utensils,
                tag: t.bento.card1Tag,
                title: t.bento.card1Title,
                desc: t.bento.card1Desc,
                meta: t.bento.card1Meta,
                glow: "from-emerald-100/50 via-transparent to-transparent",
                iconBox: "bg-emerald-50 text-[#065f46] border-emerald-200/80",
                tagStyle: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
                metaColor: "text-emerald-700",
              },
              {
                icon: QrCode,
                tag: t.bento.card2Tag,
                title: t.bento.card2Title,
                desc: t.bento.card2Desc,
                meta: t.bento.card2Meta,
                glow: "from-teal-100/50 via-transparent to-transparent",
                iconBox: "bg-teal-50 text-teal-800 border-teal-200/80",
                tagStyle: "bg-teal-50 text-teal-800 border-teal-200/70",
                metaColor: "text-teal-700",
              },
              {
                icon: Clock,
                tag: t.bento.card3Tag,
                title: t.bento.card3Title,
                desc: t.bento.card3Desc,
                meta: t.bento.card3Meta,
                glow: "from-amber-100/45 via-transparent to-transparent",
                iconBox: "bg-amber-50 text-amber-800 border-amber-200/80",
                tagStyle: "bg-amber-50 text-amber-800 border-amber-200/70",
                metaColor: "text-amber-700",
              },
            ].map((card) => (
              <div
                key={card.tag}
                className="group relative flex flex-col overflow-hidden rounded-[26px] border border-emerald-100/90 bg-white/95 p-7 shadow-[0_16px_44px_-22px_rgba(2,44,34,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/80 hover:shadow-[0_24px_54px_-22px_rgba(4,120,87,0.18)]"
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-radial opacity-80",
                    card.glow,
                  )}
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl border shadow-2xs transition-transform duration-300 group-hover:scale-105",
                      card.iconBox,
                    )}
                  >
                    <LiveIcon icon={card.icon} motion="ambient" className="size-6" />
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide",
                      card.tagStyle,
                    )}
                  >
                    {card.tag}
                  </span>
                </div>

                <h3 className="relative mt-6 font-heading text-lg font-extrabold tracking-tight text-[#022c22]">
                  {card.title}
                </h3>
                <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">
                  {card.desc}
                </p>

                <div className="relative mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold">
                  <CheckCircle2 className={cn("size-4 shrink-0", card.metaColor)} aria-hidden="true" />
                  <span className={card.metaColor}>{card.meta}</span>
                </div>
              </div>
            ))}
          </LiveIconGroup>
        </div>
      </section>

      {/* 5. Food Safety & Packaging Standards Showcase */}
      <section
        id="standards"
        className="bg-[radial-gradient(620px_380px_at_86%_22%,rgba(16,185,129,0.08),transparent_68%),linear-gradient(180deg,#f7fbf9_0%,#eff7f3_100%)] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/95 px-3.5 py-1 text-xs font-bold tracking-wide text-emerald-800 shadow-2xs">
              <ShieldCheck className="size-3.5 text-emerald-600" aria-hidden="true" />
              <span>{t.standards.badge}</span>
            </span>
            <h2 className="mt-3.5 font-heading text-2xl font-black tracking-tight text-[#022c22] sm:text-4xl">
              {t.standards.title}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {t.standards.subtitle}
            </p>
          </div>

          <div className="mt-11 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Gallery Frame */}
            <div className="lg:col-span-6">
              <div className="rounded-[28px] border border-emerald-100/90 bg-white p-2.5 shadow-[0_24px_60px_-24px_rgba(2,44,34,0.16)] sm:p-3">
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[20px]">
                  <Image
                    src="/images/surplus-food-containers.jpg"
                    alt={tx("Sealed hygienic catering containers with Kacchi Biryani and Polao")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#022c22]/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/85 bg-white/92 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-md">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#022c22]">
                      <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
                      {t.standards.photoBadge}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200/80">
                      {t.standards.photoTag}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Clean Protocol Cards (No clunky side stripes) */}
            <div className="space-y-4 lg:col-span-6">
              {[
                {
                  icon: ShieldCheck,
                  badge: t.standards.card1Badge,
                  title: t.standards.card1Title,
                  desc: t.standards.card1Desc,
                  iconStyle: "bg-emerald-50 text-[#047857] border-emerald-200/80",
                  pillStyle: "text-emerald-700",
                },
                {
                  icon: Flame,
                  badge: t.standards.card2Badge,
                  title: t.standards.card2Title,
                  desc: t.standards.card2Desc,
                  iconStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
                  pillStyle: "text-amber-700",
                },
                {
                  icon: Award,
                  badge: t.standards.card3Badge,
                  title: t.standards.card3Title,
                  desc: t.standards.card3Desc,
                  iconStyle: "bg-teal-50 text-teal-700 border-teal-200/80",
                  pillStyle: "text-teal-700",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-4 rounded-[22px] border border-emerald-100/90 bg-white/95 p-5 shadow-[0_12px_32px_-20px_rgba(2,44,34,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/75 hover:shadow-[0_18px_40px_-20px_rgba(4,120,87,0.16)]"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform duration-200 group-hover:scale-105",
                      item.iconStyle,
                    )}
                  >
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-heading text-[11px] font-bold uppercase tracking-wider",
                        item.pillStyle,
                      )}
                    >
                      {item.badge}
                    </p>
                    <h3 className="mt-1 font-heading text-base font-extrabold text-[#022c22]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Clearly labelled fictional demo reviews */}
      <section id="impact" className="bg-[#f3f8f6] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[28px] border border-emerald-900/15 bg-gradient-to-br from-[#022c22] via-[#043629] to-[#064e3b] py-12 text-white shadow-[0_24px_56px_-22px_rgba(2,44,34,0.32)]">
            <div className="px-4 text-center max-w-2xl mx-auto space-y-3 sm:px-6">
              <span className="inline-block rounded-full bg-emerald-400/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 font-heading border border-emerald-400/25">
                {t.stories.badge}
              </span>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
                {t.stories.title}
              </h2>
            </div>

            {/* Continuous Infinite Review Train Animation */}
            <div className="mt-6">
              <ReviewTrainMarquee lang={lang} compact />
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEW: Frequently Asked Questions (FAQ Accordion) */}
      <section id="faq" className="py-14 sm:py-16 bg-[radial-gradient(560px_340px_at_80%_20%,rgba(56,189,248,0.10),transparent_70%),radial-gradient(520px_340px_at_15%_85%,rgba(16,185,129,0.10),transparent_70%),#f3f8f6] border-t border-white/70">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 font-heading border border-emerald-500/25 backdrop-blur-sm">
              <HelpCircle className="size-3.5 text-emerald-600" />
              {t.faq.badge}
            </span>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
              {t.faq.title}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto font-normal">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="mt-12 space-y-3.5">
            {t.faq.items.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="liquid-glass-card overflow-hidden rounded-2xl transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? `landing-faq-answer-${idx}` : undefined}
                    className="flex w-full items-center justify-between p-5 text-left font-heading text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-xl bg-white/80 text-slate-500 shadow-2xs transition-transform duration-200 ring-1 ring-white",
                        isOpen && "rotate-180 text-emerald-700 bg-emerald-50"
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div id={`landing-faq-answer-${idx}`} className="px-5 pb-5 pt-3 text-sm leading-7 text-slate-700 font-normal border-t border-white/60 bg-white/45">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Partner Logos Strip */}
      <section id="partners" className="border-y border-white/70 bg-[#eef5f2] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-600 font-heading">
            {t.partnersTitle}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 text-center">
            {t.partnersList.map((partner) => (
              <div
                key={partner}
                className="liquid-glass-tile flex min-h-14 items-center justify-center gap-2 rounded-xl px-2.5 py-2 text-center text-xs font-extrabold text-slate-700 font-heading"
              >
                <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Clean Sunlit Call to Action Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#eaf7f0] via-[#f2fbf6] to-[#e4f5ed] py-16 text-[#022c22] border-t border-emerald-100/80">
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-[#022c22] sm:text-4xl lg:text-5xl font-heading">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            {t.cta.desc}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ROUTES.auth.registerDonor}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#065f46] px-7 font-semibold text-white shadow-[0_12px_26px_-10px_rgba(6,95,70,0.48)] hover:bg-[#047857] transition-all active:scale-95 font-heading"
            >
              {t.cta.donorBtn} <ArrowRight className="size-4" />
            </Link>
            <Link
              href={ROUTES.auth.registerNgo}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-7 font-semibold text-[#022c22] shadow-2xs hover:bg-emerald-50/70 transition-colors font-heading"
            >
              {t.cta.ngoBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Desktop & Mobile Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <BrandLogo variant="classic" />
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-700 font-heading">
              <Link href={ROUTES.donor.dashboard} className="hover:text-emerald-700">{t.nav.donorPortal}</Link>
              <Link href={ROUTES.ngo.dashboard} className="hover:text-emerald-700">{t.nav.ngoPortal}</Link>
              <Link href={ROUTES.volunteer.dashboard} className="hover:text-emerald-700">{t.nav.volunteerPortal}</Link>
              <Link href={ROUTES.auth.login} className="hover:text-emerald-700">{t.nav.login}</Link>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600 text-center sm:text-left">
            <p>{t.footer.copyright}</p>
            <p className="font-semibold text-emerald-800 font-heading">{t.footer.helpline}</p>
          </div>
        </div>
      </footer>

    </div></HeroStoryProvider>
  );
}
