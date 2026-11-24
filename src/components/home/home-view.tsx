"use client";
import { LiveIcon, LiveIconGroup } from "@/components/motion/live-icon";
import homeSloganStyles from "./home-slogan.module.css";
import mobile from "./home-mobile.module.css";
import responsive from "./home-responsive.module.css";
import { MobileHomeView } from "./mobile-home-view";
import { HeroSloganLine, HeroStoryControls, HeroStoryMedia, HeroStoryProvider } from "./hero-story";
import { UiText } from "@/lib/i18n/ui-text-node";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { localizeUiCopy } from "@/lib/i18n/ui-text";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Clock,
  HelpCircle,
  MapPin,
  Menu,
  QrCode,
  Search,
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
      urgentTag: "⚡ ১৫ মিনিটে জরুরি রেসকিউ",
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
      title: "প্রতিটি অতিরিক্ত খাবার পৌঁছাবে সঠিক মানুষের কাছে",
      subtitle:
        "কনভেনশন সেন্টার ও ক্যাফেটেরিয়ার অতিরিক্ত খাবার নষ্ট না করে নিরাপদ প্যাকেজিংয়ে অভাবী মানুষের কাছে পৌঁছে দেওয়ার ডিজিটাল নেটওয়ার্ক।",
      card1Title: "১. উদ্বৃত্ত খাবার পোস্ট",
      card1Desc:
        "হোটেল, কনভেনশন বা ক্যাফেটেরিয়া অনুষ্ঠান শেষে অতিরিক্ত খাবারের ছবি ও আনুমানিক মিল সংখ্যাসহ তাৎক্ষণিক পোস্ট করতে পারে।",
      card2Title: "২. স্মার্ট কিউআর ভেরিফিকেশন",
      card2Desc:
        "ডোনার ও রিসিভার উভয়েই কিউআর কোড স্ক্যানের মাধ্যমে খাবারের গুণগত মান যাচাই ও ডিজিটাল হস্তান্তর নিশ্চিত করেন।",
      card3Title: "৩. ৬০ মিনিটে কোল্ড-চেইন বিতরণ",
      card3Desc:
        "খাবার রান্নার সময় অনুযায়ী নিরাপদ ব্যবহারের মেয়াদ স্বয়ংক্রিয়ভাবে ট্র্যাক হয় এবং দ্রুততম ভলান্টিয়ারের কাছে অ্যালার্ট যায়।",
    },
    standards: {
      badge: "খাদ্য নিরাপত্তা",
      title: "বাণিজ্যিক মানের খাদ্য নিরাপত্তা ও সিলযুক্ত প্যাকেজিং",
      subtitle:
        "আমরা নিশ্চিত করি প্রতিটি উদ্বৃত্ত খাবার সর্বোচ্চ পুষ্টিগুণ, স্বাস্থ্যসম্মত মর্যাদা এবং নিরাপদ প্যাকেজিং বজায় রেখে বিতরণ করা হচ্ছে।",
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
      urgentTag: "⚡ 15-Minute Rapid Rescue",
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
      title: "Every surplus meal reaches the right people",
      subtitle:
        "A digital network ensuring excess food from convention centers and cafeterias is not wasted, but hygienically packaged and delivered to those in need.",
      card1Title: "1. Post Surplus Food",
      card1Desc:
        "Hotels, conventions, or cafeterias can instantly post excess food with photos and estimated portions right after events.",
      card2Title: "2. Smart QR Verification",
      card2Desc:
        "Both donors and receivers verify food quality and complete authenticated digital handovers via QR code scans.",
      card3Title: "3. 60-Minute Cold-Chain Delivery",
      card3Desc:
        "Safe consumption windows are tracked automatically based on cooking timestamps, instantly alerting the nearest volunteers.",
    },
    standards: {
      badge: "Food Safety",
      title: "Commercial Food-Grade Safety & Sealed Packaging",
      subtitle:
        "We ensure all surplus meals maintain peak nutritional quality, hygienic dignity, and secure food-grade packaging throughout delivery.",
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
  const router = useRouter();
  const { session } = useMockAuth();
  const primaryHref = session ? getRoleLandingRoute(session.role) : ROUTES.auth.roleSelection;
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [activeNav, setActiveNav] = useState<string>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Forward area searches to the account-authorized food discovery page.
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const original = copy[lang];
  const isBn = lang === "bn";
  const t = localizeUiCopy({ ...original,
    hero: { ...original.hero, subtitle: isBn ? "বিশ্ববিদ্যালয় প্রজেক্ট: surplus food দান, NGO claim, volunteer handover ও distribution record এক জায়গায়। আপনার account দিয়ে আসল তথ্য সংরক্ষণ করুন।" : "A university project connecting food donations, NGO claims, volunteer handovers and recorded distributions. Sign in to work with saved rescue records.", urgentTag: isBn ? "Donor-declared pickup deadline" : "Donor-declared pickup deadline" },
    bento: { ...original.bento, card3Title: isBn ? "সংরক্ষিত distribution record" : "Recorded distributions", card3Desc: isBn ? "NGO-এর actual distribution থেকে meal ও beneficiary count সংরক্ষিত হয়। Certificate issuance যুক্ত হয়নি।" : "Actual NGO distribution records supply meal and beneficiary counts. Certificate issuance is not connected." },
    standards: { ...original.standards, badge: isBn ? "কী সংরক্ষণ করা হয়" : "Recorded workflow", title: isBn ? "ঘোষণা, handover ও distribution" : "Declarations, handovers and distributions", subtitle: isBn ? "Food safety পরীক্ষা বা temperature monitoring করা হচ্ছে না।" : "Food testing and temperature monitoring are not connected.", card1Title: isBn ? "দাতার ঘোষণা" : "Donor declarations", card1Desc: isBn ? "দাতা preparation time, pickup deadline ও storage method ঘোষণা করেন।" : "The donor supplies preparation time, pickup deadline and storage declarations.", card2Title: "OTP handover", card2Desc: isBn ? "নির্ধারিত volunteer ছয় সংখ্যার pickup ও delivery code যাচাই করেন।" : "The assigned volunteer verifies six-digit pickup and delivery codes.", card3Title: "Distribution record", card3Desc: isBn ? "NGO receipt ও actual distribution সংরক্ষণ করে।" : "The receiving NGO records receipt and actual distribution." },
    stories: { ...original.stories, badge: tx("Demo reviews"), title: tx("Small stories about sharing food"), subtitle: tx("Sample names, profiles and comments for the demo. These are not real user reviews.") },
    faq: { ...original.faq, items: [
      { q: isBn ? "কীভাবে শুরু করব?" : "How do I start?", a: isBn ? "ভূমিকা বেছে নিবন্ধন করুন। আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে অনুমোদিত হবে।" : "Choose a role and register. Your account is approved automatically." },
      { q: isBn ? "Food safety পরীক্ষা করা হয়?" : "Does the app test food safety?", a: isBn ? "না। App দাতার declaration, deadline ও handover record সংরক্ষণ করে। খাবারের quality বা temperature স্বাধীনভাবে পরীক্ষা করা হয় না।" : "No. The app stores donor declarations, deadlines and handover records. Food quality and temperature are not independently tested." },
      { q: isBn ? "কীভাবে handover হয়?" : "How do handovers work?", a: isBn ? "NGO claim করার পরে volunteer mission গ্রহণ করেন। Donor pickup code এবং NGO delivery code দেন; assigned volunteer সেগুলো যাচাই করেন।" : "After an NGO claim, a volunteer accepts the mission. The donor issues a pickup code and the NGO a delivery code; the assigned volunteer verifies them." },
      { q: isBn ? "কোন feature এখনও বাকি?" : "Which features remain pending?", a: isBn ? "Live GPS, road ETA, SMS/push, team invitation, support ticket, certificate issuance ও পূর্ণ admin dashboard এখনও যুক্ত হয়নি।" : "Live GPS, road ETA, SMS/push, team invitations, support tickets, certificates and the full admin dashboard are not connected yet." },
    ] },
    footer: { ...original.footer, helpline: isBn ? "Project hotline যুক্ত হয়নি। Account সহায়তার জন্য project operator-এর সাথে যোগাযোগ করুন।" : "A project hotline is not configured. Contact your project operator for account help." },
  }, lang);

  useEffect(() => {
    const sectionIds = [
      "how-it-works",
      "standards",
      "impact",
      "faq",
    ];
    const handleScroll = () => {
      if (window.innerWidth < 1024) return;
      // Dynamic scroll contraction trigger
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);

      if (window.scrollY < 200) {
        setActiveNav("hero");
        return;
      }
      const scrollPos = window.scrollY + 200;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNav(id);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", handleScroll); };
  }, []);

  const navLinks = [
    { id: "hero", label: t.nav.home, href: "#hero" },
    { id: "how-it-works", label: t.nav.howItWorks, href: "#how-it-works" },
    { id: "standards", label: t.nav.safety, href: "#standards" },
    { id: "impact", label: t.nav.impact, href: "#impact" },
    { id: "faq", label: t.nav.faq, href: "#faq" },
  ];

  const handleNavClick = (id: string, href: string) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        const headerOffset = 70;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: "smooth",
        });
      }
    }, 60);
  };

  function openFoodDiscovery(query: string) {
    const value = query.trim();
    const target = `${ROUTES.ngo.discover}${value ? `?q=${encodeURIComponent(value)}` : ""}`;
    router.push(session?.role === UserRole.NGO ? target : `${ROUTES.auth.login}?next=${encodeURIComponent(target)}`);
  }

  function handleZoneSelect(zone: string) {
    openFoodDiscovery(zone);
  }

  function handleHeroSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    openFoodDiscovery(searchQuery);
  }

  return (
    <HeroStoryProvider><MobileHomeView /><div className={cn("min-h-screen bg-[#f8faf9] text-ink-900 selection:bg-emerald-100 selection:text-emerald-900 antialiased", mobile.page, responsive.desktop)}>
      {/* 1. Header / Navbar with Smart Dynamic Scroll Contraction */}
      <header
        data-scrolled={isScrolled}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300 ease-in-out",
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/90 before:to-transparent before:transition-opacity before:duration-300",
          isScrolled
            ? "border-b border-slate-200/70 bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] before:opacity-100"
            : "border-b border-slate-200/30 bg-white/50 backdrop-blur-md shadow-none before:opacity-0",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out", mobile.headerRow,
            isScrolled ? "h-14 sm:h-14" : "h-18 sm:h-20",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-6 transition-transform duration-300 origin-left", mobile.logo,
              isScrolled ? "scale-95" : "scale-100",
            )}
          >
            <BrandLogo />
          </div>

          {/* Desktop Navigation Links (Clean, Sequential & Balanced) */}
          <nav className="hidden items-center gap-4 xl:gap-6 lg:flex">
            {navLinks.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id, item.href);
                  }}
                  className={cn(
                    "group relative rounded-xl px-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                    isScrolled ? "py-1" : "py-1.5",
                    isActive
                      ? "text-emerald-900 font-extrabold bg-emerald-50/70 backdrop-blur-xs"
                      : "text-slate-600 hover:text-emerald-800 hover:bg-white/60 hover:backdrop-blur-xs font-semibold",
                  )}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.5)] transition-all duration-200" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Apple-Style Segmented Language Switcher */}
            <div
              className={cn(
                "inline-flex items-center p-0.5 rounded-xl border border-white/70 bg-slate-200/50 backdrop-blur-md text-xs font-semibold select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300",
                isScrolled ? "h-8" : "h-9", mobile.language,
              )}
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={cn(
                  "cursor-pointer rounded-lg text-[11px] sm:text-xs font-bold transition-all leading-none",
                  isScrolled ? "px-1.5 sm:px-2 py-0.5" : "px-2 sm:px-2.5 py-1",
                  lang === "en"
                    ? "bg-white/95 text-emerald-900 shadow-2xs font-extrabold backdrop-blur-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              ><UiText source={"EN"} /></button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                aria-pressed={lang === "bn"}
                className={cn(
                  "cursor-pointer rounded-lg text-[11px] sm:text-xs font-bold transition-all leading-none",
                  isScrolled ? "px-1.5 sm:px-2 py-0.5" : "px-2 sm:px-2.5 py-1",
                  lang === "bn"
                    ? "bg-white/95 text-emerald-900 shadow-2xs font-extrabold backdrop-blur-xs"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {tx("বাংলা")}</button>
            </div>

            <Link
              href={ROUTES.auth.login}
              className={cn(
                "hidden sm:inline-flex items-center rounded-xl text-xs font-bold text-slate-800 hover:text-emerald-950 bg-white/80 hover:bg-white/95 border border-slate-200/80 backdrop-blur-xs transition-all duration-300 px-3 sm:px-3.5 shadow-2xs active:scale-95 touch-manipulation cursor-pointer",
                isScrolled ? "h-8" : "h-9",
              )}
            >
              {t.nav.login}
            </Link>

            <Link
              href={ROUTES.auth.roleSelection}
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-600 text-xs font-bold text-white shadow-[0_2px_12px_rgba(16,185,129,0.32),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95",
                isScrolled ? "h-8.5 px-3.5" : "h-9 px-4",
              )}
            >
              <span>{t.nav.join}</span>
              <ArrowRight className="size-3.5" />
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
                <span>🔑 {t.nav.login} {" "}{tx("করুন (ড্যাশবোর্ড)")}</span>
                <ArrowRight className="size-4" />
              </a>

              {/* 1-Tap Direct Role Portal Access */}
              <div className="grid grid-cols-3 gap-1.5">
                <Link
                  href="/login?next=/donor/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/80 p-2 text-center text-[11px] font-bold text-emerald-900 active:scale-95"
                >
                  <span className="text-base">👨‍🍳</span>
                  <span>{tx("ডোনার")}</span>
                </Link>
                <Link
                  href="/login?next=/ngo/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center rounded-xl border border-teal-100 bg-teal-50/80 p-2 text-center text-[11px] font-bold text-teal-900 active:scale-95"
                >
                  <span className="text-base">🏢</span>
                  <span>{tx("এনজিও")}</span>
                </Link>
                <Link
                  href="/login?next=/volunteer/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50/80 p-2 text-center text-[11px] font-bold text-amber-900 active:scale-95"
                >
                  <span className="text-base">🚴</span>
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
      <section id="hero" className={cn("relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 text-white", mobile.hero)}>
        {/* Full-bleed Emotional Background Image */}
        <div className="absolute inset-0 z-0">
          <HeroStoryMedia imageClassName={cn("object-cover object-center", mobile.background)} />
          {/* Deep dark-green gradient overlay on the left for contrast, open/transparent on the right so background is visible */}
          <div className={cn("absolute inset-0 bg-gradient-to-r from-[#011d15]/98 via-[#011d15]/80 to-black/20", mobile.shade)} />
          <div className="absolute inset-0 bg-radial-[at_top_left] from-emerald-500/15 via-transparent to-transparent" />
        </div>
        <HeroStoryControls />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn("grid gap-12 lg:grid-cols-12 lg:items-center", mobile.layout)}>
            {/* Left 7 Columns: Content kept on left */}
            <div className={cn("lg:col-span-7 space-y-6 text-left", mobile.content)}>
              <div className={cn("inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-4 py-1.5 text-xs font-extrabold text-emerald-300 shadow-lg backdrop-blur-md font-heading", mobile.badge)}>
                <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
                <span>{t.hero.badge}</span>
              </div>

              <h1 className={homeSloganStyles.slogan}>
                {t.hero.titlePart1}
                <HeroSloganLine className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  {t.hero.titleHighlight}
                </HeroSloganLine>
              </h1>

              <p className={cn("max-w-2xl text-xs sm:text-base lg:text-lg leading-relaxed text-emerald-100/90 font-normal", mobile.subtitle)}>
                {t.hero.subtitle}
              </p>

              <div className={responsive.heroActions}>
                <Link href={primaryHref} className={responsive.primaryAction}>
                  {tx(session ? "Continue to dashboard" : "Join ShareBite")}
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                {!session && <Link href={ROUTES.auth.login} className={responsive.secondaryAction}>
                  {t.nav.login}
                </Link>}
              </div>

              <details className={responsive.foodSearch}>
                <summary>
                  <Building2 className="size-5" aria-hidden="true" />
                  {tx("Find food for your NGO")}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </summary>
                {/* Integrated Search & Action Box (Floating Glass Style) */}
                <form onSubmit={handleHeroSearchSubmit} className={cn("rounded-2xl border border-emerald-500/30 bg-white/95 p-3 shadow-2xl backdrop-blur-md sm:p-3.5 text-left", mobile.search)}>
                  <div className={cn("grid gap-2 sm:grid-cols-12", mobile.searchRow)}>
                    <div className={cn("relative flex items-center sm:col-span-7", mobile.inputWrap)}>
                      <MapPin className="pointer-events-none absolute left-3.5 size-5 text-emerald-600" />
                      <input
                        type="text"
                        aria-label={tx("Search by area")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.hero.searchPlaceholder}
                        className="h-12 w-full rounded-xl border-none bg-slate-100/80 pl-11 pr-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div className={cn("sm:col-span-5 flex items-center", mobile.searchAction)}>
                      <button
                        type="submit"
                        className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-600 transition-all font-heading cursor-pointer active:scale-98", mobile.searchButton)}
                      >
                        <Search className="size-4" />
                        <span>{t.hero.searchBtn}</span>
                      </button>
                    </div>
                  </div>

                  <div className={cn("mt-2.5 flex flex-wrap items-center justify-between px-2 pt-1.5 text-[11px] text-slate-600 font-medium border-t border-slate-200/60", mobile.searchMeta)}>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-slate-800">{t.hero.popularLabel}</strong>
                      <button
                        type="button"
                        onClick={() => handleZoneSelect("gulshan")}
                        className="hover:text-emerald-700 hover:underline cursor-pointer"
                      >
                        {tx("গুলশান ১ ও ২")}</button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleZoneSelect("dhanmondi")}
                        className="hover:text-emerald-700 hover:underline cursor-pointer"
                      >
                        {tx("ধানমন্ডি ২৭")}</button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleZoneSelect("badda")}
                        className="hover:text-emerald-700 hover:underline cursor-pointer font-bold text-emerald-800"
                      >
                        {tx("বাড্ডা UIU ক্যাম্পাস")}</button>
                    </span>
                    <span className="text-emerald-700 font-extrabold">{t.hero.urgentTag}</span>
                  </div>
                </form>
              </details>

            </div>

            {/* Right 5 Columns: Kept clear so the emotional background image remains visible */}
            <div className="hidden lg:block lg:col-span-5" />
          </div>
        </div>
      </section>

      {/* 3. Bento Grid: Civic Infrastructure in Action (উদ্ধার প্রক্রিয়া) */}
      <section id="how-it-works" className="py-14 sm:py-16 bg-white border-b border-slate-200/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 font-heading border border-emerald-600/20">
              {t.bento.badge}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
              {t.bento.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              {t.bento.subtitle}
            </p>
          </div>

          <LiveIconGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Bento Card 1 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
                <LiveIcon icon={Utensils} motion="ambient" className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card1Title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {t.bento.card1Desc}
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
                <LiveIcon icon={QrCode} motion="ambient" className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card2Title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {t.bento.card2Desc}
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700 shadow-2xs">
                <LiveIcon icon={Clock} motion="ambient" className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card3Title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {t.bento.card3Desc}
              </p>
            </div>
          </LiveIconGroup>
        </div>
      </section>

      {/* 5. Food Safety & Packaging Standards */}
      <section id="standards" className="border-t border-slate-200/90 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 font-heading border border-emerald-600/20">
              {t.standards.badge}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
              {t.standards.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              {t.standards.subtitle}
            </p>
          </div>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
                <Image
                  src="/images/surplus-food-containers.jpg"
                  alt={tx("Sealed hygienic catering containers with Kacchi Biryani and Polao")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
                  {t.standards.card1Badge}
                </p>
                <h4 className="mt-1 text-base font-bold text-slate-900 font-heading">
                  {t.standards.card1Title}
                </h4>
                <p className="mt-1.5 text-sm leading-7 text-slate-600">
                  {t.standards.card1Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 font-heading">
                  {t.standards.card2Badge}
                </p>
                <h4 className="mt-1 text-base font-bold text-slate-900 font-heading">
                  {t.standards.card2Title}
                </h4>
                <p className="mt-1.5 text-sm leading-7 text-slate-600">
                  {t.standards.card2Desc}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700 font-heading">
                  {t.standards.card3Badge}
                </p>
                <h4 className="mt-1 text-base font-bold text-slate-900 font-heading">
                  {t.standards.card3Title}
                </h4>
                <p className="mt-1.5 text-sm leading-7 text-slate-600">
                  {t.standards.card3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Clearly labelled fictional demo reviews */}
      <section id="impact" className="py-12 sm:py-14 bg-gradient-to-b from-[#01140e] to-[#021f17] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 font-heading border border-emerald-400/30">
              {t.stories.badge}
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
              {t.stories.title}
            </h2>
          </div>

          {/* Continuous Infinite Review Train Animation */}
          <div className="mt-6 -mx-4 sm:-mx-6 lg:-mx-8">
            <ReviewTrainMarquee lang={lang} compact />
          </div>
        </div>
      </section>

      {/* 8. NEW: Frequently Asked Questions (FAQ Accordion) */}
      <section id="faq" className="py-14 sm:py-16 bg-white border-t border-slate-200/90">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 font-heading border border-emerald-600/20">
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
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 transition-all duration-200"
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
                        "grid size-8 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-2xs transition-transform duration-200 ring-1 ring-slate-200/70",
                        isOpen && "rotate-180 text-emerald-700 bg-emerald-50"
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div id={`landing-faq-answer-${idx}`} className="px-5 pb-5 pt-3 text-sm leading-7 text-slate-600 font-normal border-t border-slate-200/60 bg-white">
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
      <section id="partners" className="border-y border-slate-200/90 bg-[#f8faf9] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-600 font-heading">
            {t.partnersTitle}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 text-center">
            {t.partnersList.map((partner) => (
              <div
                key={partner}
                className="flex h-14 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-3 text-sm font-extrabold text-slate-700 shadow-2xs font-heading"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. High-Impact Call to Action Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#03271d] to-[#011a13] py-18 text-white">
        <div className="absolute inset-0 dark-surface-grid opacity-25" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl font-heading">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-emerald-100/80 font-normal">
            {t.cta.desc}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ROUTES.auth.registerDonor}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 font-extrabold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-95 font-heading"
            >
              {t.cta.donorBtn} <ArrowRight className="size-4" />
            </Link>
            <Link
              href={ROUTES.auth.registerNgo}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-7 font-extrabold text-emerald-100 hover:bg-emerald-900/60 transition-colors font-heading"
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
            <BrandLogo />
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
