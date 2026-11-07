"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplets,
  HeartHandshake,
  HelpCircle,
  Leaf,
  MapPin,
  Menu,
  PackageCheck,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Truck,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { HeroTicker } from "@/components/home/hero-ticker";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const copy = {
  bn: {
    nav: {
      home: "হোম",
      howItWorks: "উদ্ধার প্রক্রিয়া",
      liveFeed: "লাইভ ফিড",
      safety: "খাদ্য নিরাপত্তা",
      calculator: "ইমপ্যাক্ট ক্যালকুলেটর",
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
      titlePart1: "অতিরিক্ত খাবার নষ্ট নয়, ",
      titleHighlight: "সম্মানের সাথে মানুষের পাতে।",
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
    liveFeed: {
      badge: "ঢাকা মেট্রো লাইভ খাদ্য উদ্ধার বোর্ড",
      title: "এই মুহূর্তে উদ্ধারযোগ্য তাজা খাবার",
      subtitle:
        "বিশ্ববিদ্যালয় ক্যাফেটেরিয়া ও ক্যাটারার্স থেকে সদ্য পোস্টকৃত উদ্বৃত্ত খাবার। নিরাপদ খাদ্য প্রোটোকল মেনে দ্রুততম সময়ে ক্লেইম করুন।",
      allZones: "সব এলাকা",
      zoneBadda: "বাড্ডা ও আফতাবনগর",
      zoneGulshan: "গুলশান ও বনানী",
      zoneDhanmondi: "ধানমন্ডি",
      zoneMirpur: "মিরপুর",
      statusClaimed: "ক্লেইম সম্পন্ন",
      statusPending: "ক্লেইম অপেক্ষমাণ",
      statusEnroute: "রাইডার রওয়ানা হয়েছে",
      timeLeft: "বাকি",
      portions: "প্যাকেট",
      claimBtn: "ক্লেইম করুন / বিস্তারিত",
      urgentBadge: "জরুরি রেসকিউ",
      safetyBadge: "বিএফএসএ সনদপ্রাপ্ত",
      emptyState: "এই ফিল্টারে কোনো সক্রিয় খাবার পাওয়া যায়নি। অন্যান্য এলাকা চেক করুন।",
      modalTitle: "খাদ্য উদ্ধারের বিস্তারিত বিবরণ",
      modalDonor: "দাতা প্রতিষ্ঠান:",
      modalLocation: "পিকআপ লোকেশন:",
      modalCooked: "প্রস্তুতের সময়:",
      modalSafeUntil: "নিরাপদ ব্যবহারের মেয়াদ:",
      modalTemp: "সংরক্ষণ তাপমাত্রা:",
      modalActionNgo: "এনজিও হিসেবে ক্লেইম করুন",
      modalActionClose: "বন্ধ করুন",
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
    calculator: {
      badge: "ইমপ্যাক্ট সিমুলেটর",
      title: "আপনার প্রতিষ্ঠান কত মানুষের মুখে খাবার তুলে দিতে পারে?",
      subtitle:
        "ক্যাফেটেরিয়া বা ক্যাটারিংয়ের সাপ্তাহিক উদ্বৃত্ত খাবার নষ্ট না করে কী পরিমাণ মানবিক ও পরিবেশগত প্রভাব তৈরি করতে পারবেন তা পরিমাপ করুন।",
      sliderLabel: "প্রতি সপ্তাহে আনুমানিক উদ্বৃত্ত খাবার (প্যাকেট সংখ্যা):",
      monthlyMeals: "মাসে রক্ষা পাওয়া খাবার",
      peopleFed: "উপকৃত মানুষের সংখ্যা",
      co2Saved: "কার্বন নির্গমন রোধ",
      waterSaved: "সংরক্ষিত পানির অপচয়",
      mealsUnit: "প্যাকেট",
      peopleUnit: "জন",
      co2Unit: "কেজি CO₂e",
      waterUnit: "লিটার",
      ctaBtn: "খাদ্য দাতা হিসেবে যুক্ত হোন",
      helper: "জাতিসংঘের পরিবেশ কর্মসূচি (UNEP) ও স্থানীয় ফুড-ওয়েস্ট গবেষণা মডেল অনুযায়ী আনুমানিক হিসাব।",
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
      liveFeed: "Live Feed",
      safety: "Food Safety",
      calculator: "Impact Calculator",
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
      titlePart1: "No surplus food goes to waste, ",
      titleHighlight: "reaching plates with dignity.",
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
    liveFeed: {
      badge: "Dhaka Metro Live Rescue Board",
      title: "Surplus Meals Available Right Now",
      subtitle:
        "Fresh excess meals posted right now from cafeterias and caterers. Claim swiftly in compliance with food safety protocols.",
      allZones: "All Areas",
      zoneBadda: "Badda & Aftabnagar",
      zoneGulshan: "Gulshan & Banani",
      zoneDhanmondi: "Dhanmondi",
      zoneMirpur: "Mirpur",
      statusClaimed: "Claim Completed",
      statusPending: "Awaiting Claim",
      statusEnroute: "Rider En Route",
      timeLeft: "Remaining",
      portions: "Boxes",
      claimBtn: "Claim / Inspect",
      urgentBadge: "Urgent Rescue",
      safetyBadge: "BFSA Certified",
      emptyState: "No surplus meals matching this filter right now. Check other areas.",
      modalTitle: "Surplus Food Rescue Details",
      modalDonor: "Donor Organization:",
      modalLocation: "Pickup Location:",
      modalCooked: "Cooking Time:",
      modalSafeUntil: "Safe Consumption Window:",
      modalTemp: "Storage Temperature:",
      modalActionNgo: "Claim as Verified NGO",
      modalActionClose: "Close",
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
    calculator: {
      badge: "Impact Simulator",
      title: "How many meals could your cafeteria save?",
      subtitle:
        "Estimate the humanitarian and environmental benefits your institution can achieve by diverting surplus meals each week.",
      sliderLabel: "Estimated Weekly Surplus Meals (Portions):",
      monthlyMeals: "Meals Rescued / Month",
      peopleFed: "Hungry People Fed",
      co2Saved: "CO₂ Emissions Diverted",
      waterSaved: "Water Conserved",
      mealsUnit: "Boxes",
      peopleUnit: "People",
      co2Unit: "kg CO₂e",
      waterUnit: "Liters",
      ctaBtn: "Join as Food Donor",
      helper: "Estimates based on UNEP food waste benchmarks and local Dhaka civic rescue metrics.",
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

interface RescueListing {
  id: string;
  donor: string;
  zone: "badda" | "gulshan" | "dhanmondi" | "mirpur";
  locationBn: string;
  locationEn: string;
  titleBn: string;
  titleEn: string;
  portions: number;
  cookTimeBn: string;
  cookTimeEn: string;
  timeLeftMinutes: number;
  status: "enroute" | "pending" | "claimed";
  statusTextBn: string;
  statusTextEn: string;
  receiverBn: string;
  receiverEn: string;
  tempBn: string;
  tempEn: string;
  urgent: boolean;
}

const LIVE_RESCUE_LISTINGS: RescueListing[] = [
  {
    id: "rec-1",
    donor: "UIU Central Cafeteria",
    zone: "badda",
    locationBn: "মাদানী এভিনিউ, ১০০ ফিট রোড, বাড্ডা",
    locationEn: "Madani Avenue, 100 Feet Rd, Badda",
    titleBn: "চিকেন বিরিয়ানি ও ডিম",
    titleEn: "Chicken Biryani & Boiled Egg",
    portions: 120,
    cookTimeBn: "দুপুর ২:৩০",
    cookTimeEn: "2:30 PM",
    timeLeftMinutes: 75,
    status: "enroute",
    statusTextBn: "রাইডার রওয়ানা হয়েছে 🛵",
    statusTextEn: "Rider En Route 🛵",
    receiverBn: "মাস্তুল ফাউন্ডেশন শেল্টার",
    receiverEn: "Mastul Foundation Shelter",
    tempBn: "৬০°C হট-হোল্ড",
    tempEn: "60°C Hot-Hold",
    urgent: true,
  },
  {
    id: "rec-2",
    donor: "Radisson Blu Dhaka Water Garden",
    zone: "gulshan",
    locationBn: "এয়ারপোর্ট রোড, কুর্মিটোলা, ঢাকা",
    locationEn: "Airport Road, Kurmitola, Dhaka",
    titleBn: "শাহী বিফ তেহারি ও ফিরনি",
    titleEn: "Shahi Beef Tehari & Firni",
    portions: 75,
    cookTimeBn: "বিকেল ৫:০০",
    cookTimeEn: "5:00 PM",
    timeLeftMinutes: 140,
    status: "pending",
    statusTextBn: "ক্লেইম অপেক্ষমাণ 🟢",
    statusTextEn: "Awaiting Claim 🟢",
    receiverBn: "যাচাইকৃত এনজিওর অপেক্ষায়",
    receiverEn: "Waiting for Verified NGO",
    tempBn: "৬৫°C ইনসুলেটেড",
    tempEn: "65°C Insulated",
    urgent: false,
  },
  {
    id: "rec-3",
    donor: "Dhanmondi Party Center & Convention",
    zone: "dhanmondi",
    locationBn: "রোড ২৭, ধানমন্ডি, ঢাকা",
    locationEn: "Road 27, Dhanmondi, Dhaka",
    titleBn: "কাচ্চি বিরিয়ানি ও বোরহানি (মেজবান)",
    titleEn: "Kacchi Biryani & Borhani (Catering)",
    portions: 180,
    cookTimeBn: "দুপুর ৩:১৫",
    cookTimeEn: "3:15 PM",
    timeLeftMinutes: 40,
    status: "claimed",
    statusTextBn: "বিদ্যানন্দ ক্লেইম করেছে 🛡️",
    statusTextEn: "Claimed by Bidyanondo 🛡️",
    receiverBn: "বিদ্যানন্দ চ্যারিটি কিচেন",
    receiverEn: "Bidyanondo Charity Kitchen",
    tempBn: "হাইজিন সিলযুক্ত",
    tempEn: "Hygiene Sealed",
    urgent: true,
  },
  {
    id: "rec-4",
    donor: "Tasty Treat & Mithai Hub",
    zone: "mirpur",
    locationBn: "মিরপুর ১০ গোলচত্বর, ঢাকা",
    locationEn: "Mirpur 10 Circle, Dhaka",
    titleBn: "চিকেন পেস্ট্রি, প্যাটিস ও বান",
    titleEn: "Chicken Pastry, Patties & Buns",
    portions: 60,
    cookTimeBn: "সন্ধ্যা ৬:০০",
    cookTimeEn: "6:00 PM",
    timeLeftMinutes: 190,
    status: "pending",
    statusTextBn: "ক্লেইম অপেক্ষমাণ 🟢",
    statusTextEn: "Awaiting Claim 🟢",
    receiverBn: "যাচাইকৃত এনজিওর অপেক্ষায়",
    receiverEn: "Waiting for Verified NGO",
    tempBn: "ড্রাই স্টোরেজ ফুডবক্স",
    tempEn: "Dry Storage Foodbox",
    urgent: false,
  },
];

export function HomeView() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [activeNav, setActiveNav] = useState<string>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filter state for Live Rescue Feed
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [activeListingModal, setActiveListingModal] = useState<RescueListing | null>(null);

  // Impact Calculator state
  const [impactMeals, setImpactMeals] = useState<number>(120);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const t = copy[lang];

  useEffect(() => {
    const sectionIds = [
      "how-it-works",
      "live-feed",
      "standards",
      "calculator",
      "impact",
      "faq",
    ];
    const handleScroll = () => {
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
            setActiveNav(id === "calculator" ? "impact" : id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "hero", label: t.nav.home, href: "#hero" },
    { id: "how-it-works", label: t.nav.howItWorks, href: "#how-it-works" },
    { id: "live-feed", label: t.nav.liveFeed, href: "#live-feed" },
    { id: "standards", label: t.nav.safety, href: "#standards" },
    { id: "impact", label: t.nav.impact, href: "#impact" },
    { id: "faq", label: t.nav.faq, href: "#faq" },
  ];

  function handleZoneSelect(zone: string) {
    setSelectedZone(zone);
    const feedEl = document.getElementById("live-feed");
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleHeroSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes("বাড্ডা") || query.includes("badda") || query.includes("uiu")) {
      setSelectedZone("badda");
    } else if (query.includes("গুলশান") || query.includes("gulshan") || query.includes("বনানী") || query.includes("banani")) {
      setSelectedZone("gulshan");
    } else if (query.includes("ধানমন্ডি") || query.includes("dhanmondi")) {
      setSelectedZone("dhanmondi");
    } else if (query.includes("মিরপুর") || query.includes("mirpur")) {
      setSelectedZone("mirpur");
    } else {
      setSelectedZone("all");
    }

    const feedEl = document.getElementById("live-feed");
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  const filteredListings = useMemo(() => {
    return LIVE_RESCUE_LISTINGS.filter((item) => {
      const matchZone = selectedZone === "all" || item.zone === selectedZone;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.donor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchZone && matchSearch;
    });
  }, [selectedZone, searchQuery]);

  // Reactive calculations for Impact Calculator
  const calcMonthlyMeals = impactMeals * 4;
  const calcPeopleFed = Math.round(calcMonthlyMeals * 1.25);
  const calcCo2Saved = Math.round(calcMonthlyMeals * 2.4);
  const calcWaterSaved = Math.round(calcMonthlyMeals * 160);

  return (
    <div className="min-h-screen bg-[#f8faf9] text-ink-900 selection:bg-emerald-100 selection:text-emerald-900 antialiased">
      {/* 1. Header / Navbar with Language Switcher and Mobile Drawer */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <BrandLogo />
          </div>

          {/* Desktop Navigation Links (Clean, Sequential & Balanced) */}
          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {navLinks.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    setActiveNav(item.id);
                    if (item.id === "hero") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`group relative py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-emerald-800 font-extrabold"
                      : "text-slate-600 hover:text-emerald-700 font-semibold"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-600 transition-all duration-200" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Apple-Style Segmented Language Switcher */}
            <div className="inline-flex h-9 items-center p-0.5 rounded-xl border border-slate-200/80 bg-slate-100/80 text-xs font-semibold select-none shadow-2xs">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition-all leading-none ${
                  lang === "en"
                    ? "bg-white text-emerald-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold transition-all leading-none ${
                  lang === "bn"
                    ? "bg-white text-emerald-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                বাংলা
              </button>
            </div>

            <Link
              href={ROUTES.auth.login}
              className="hidden sm:inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-bold text-slate-700 hover:text-emerald-900 hover:bg-slate-100 transition-colors"
            >
              {t.nav.login}
            </Link>

            <Link
              href={ROUTES.auth.roleSelection}
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-bold text-white shadow-2xs transition-all active:scale-95"
            >
              <span>{t.nav.join}</span>
              <ArrowRight className="size-3.5" />
            </Link>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="grid size-9 place-items-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs lg:hidden hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200/90 bg-white px-4 py-6 shadow-xl lg:hidden animate-in slide-in-from-top duration-200">
            <nav className="grid gap-3">
              {navLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    setActiveNav(item.id);
                    setIsMobileMenuOpen(false);
                    if (item.id === "hero") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`rounded-xl px-3 py-2 text-sm font-heading font-bold transition-colors ${
                    activeNav === item.id
                      ? "bg-emerald-50 text-emerald-800 font-black"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
              <Link
                href={ROUTES.auth.roleSelection}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md font-heading"
              >
                {t.nav.join} <ArrowRight className="size-4" />
              </Link>
              <Link
                href={ROUTES.auth.login}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 font-heading"
              >
                {t.nav.login}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section with Background Image & Intact Right Column */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 text-white">
        {/* Full-bleed Emotional Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bangladesh-food-rescue-hero.jpg"
            alt="Happy community and volunteers rescuing food in Bangladesh"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Deep dark-green gradient overlay on the left for contrast, open/transparent on the right so background is visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#011d15]/98 via-[#011d15]/80 to-black/20" />
          <div className="absolute inset-0 bg-radial-[at_top_left] from-emerald-500/15 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left 7 Columns: Content kept on left */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-4 py-1.5 text-xs font-extrabold text-emerald-300 shadow-lg backdrop-blur-md font-heading">
                <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
                {t.hero.badge}
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.6rem] lg:leading-[1.14] font-heading">
                {t.hero.titlePart1}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                  {t.hero.titleHighlight}
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-emerald-100/90 font-normal">
                {t.hero.subtitle}
              </p>

              {/* Integrated Search & Action Box (Floating Glass Style) */}
              <form onSubmit={handleHeroSearchSubmit} className="rounded-2xl border border-emerald-500/30 bg-white/95 p-3 shadow-2xl backdrop-blur-md sm:p-3.5 text-left">
                <div className="grid gap-2 sm:grid-cols-12">
                  <div className="relative flex items-center sm:col-span-7">
                    <MapPin className="pointer-events-none absolute left-3.5 size-5 text-emerald-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.hero.searchPlaceholder}
                      className="h-12 w-full rounded-xl border-none bg-slate-100/80 pl-11 pr-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-5 flex items-center">
                    <button
                      type="submit"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-600 transition-all font-heading cursor-pointer active:scale-98"
                    >
                      <Search className="size-4" />
                      <span>{t.hero.searchBtn}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between px-2 pt-1.5 text-[11px] text-slate-600 font-medium border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-slate-800">{t.hero.popularLabel}</strong>
                    <button
                      type="button"
                      onClick={() => handleZoneSelect("gulshan")}
                      className="hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      গুলশান ১ ও ২
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleZoneSelect("dhanmondi")}
                      className="hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      ধানমন্ডি ২৭
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleZoneSelect("badda")}
                      className="hover:text-emerald-700 hover:underline cursor-pointer font-bold text-emerald-800"
                    >
                      বাড্ডা UIU ক্যাম্পাস
                    </button>
                  </span>
                  <span className="text-emerald-700 font-extrabold">{t.hero.urgentTag}</span>
                </div>
              </form>

              {/* Dynamic Live Metric Ticker with Telemetry Pulses */}
              <HeroTicker lang={lang} />
            </div>

            {/* Right 5 Columns: Kept clear so the emotional background image remains visible */}
            <div className="hidden lg:block lg:col-span-5" />
          </div>
        </div>
      </section>

      {/* 3. Bento Grid: Civic Infrastructure in Action (উদ্ধার প্রক্রিয়া) */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-white border-b border-slate-200/90">
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

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Bento Card 1 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-2xs">
                <Utensils className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card1Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {t.bento.card1Desc}
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 shadow-2xs">
                <QrCode className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card2Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {t.bento.card2Desc}
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-[#f8faf9] p-7 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700 shadow-2xs">
                <Clock className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-900 font-heading">
                {t.bento.card3Title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {t.bento.card3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Emergency Surplus Rescue Board (ঢাকা মেট্রো লাইভ খাদ্য উদ্ধার বোর্ড) */}
      <section id="live-feed" className="py-20 sm:py-24 bg-[#f8faf9] border-b border-slate-200/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 font-heading border border-emerald-600/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                {t.liveFeed.badge}
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl font-heading">
                {t.liveFeed.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-2xl font-normal">
                {t.liveFeed.subtitle}
              </p>
            </div>

            {/* Area Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold font-heading">
              {[
                { key: "all", label: t.liveFeed.allZones },
                { key: "badda", label: t.liveFeed.zoneBadda },
                { key: "gulshan", label: t.liveFeed.zoneGulshan },
                { key: "dhanmondi", label: t.liveFeed.zoneDhanmondi },
                { key: "mirpur", label: t.liveFeed.zoneMirpur },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedZone(tab.key)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 transition-all cursor-pointer",
                    selectedZone === tab.key
                      ? "bg-emerald-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surplus Rescue Cards Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredListings.map((listing) => {
              const isUrgent = listing.urgent;
              return (
                <div
                  key={listing.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-emerald-500/80 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
                >
                  {/* Top Bar with Urgency and Portions */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold font-heading",
                          isUrgent
                            ? "bg-amber-50 text-amber-800 ring-1 ring-amber-500/20"
                            : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/20"
                        )}
                      >
                        {isUrgent && <Zap className="size-3 text-amber-500 fill-amber-500" />}
                        {isUrgent ? t.liveFeed.urgentBadge : t.liveFeed.safetyBadge}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 font-mono">
                        <Clock className="size-3 text-slate-400" />
                        {listing.timeLeftMinutes} মি. {t.liveFeed.timeLeft}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-heading leading-snug">
                      {lang === "bn" ? listing.titleBn : listing.titleEn}
                    </h3>

                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Utensils className="size-3.5 text-emerald-600" />
                        {listing.donor}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <MapPin className="size-3.5 text-slate-400 shrink-0" />
                        {lang === "bn" ? listing.locationBn : listing.locationEn}
                      </p>
                    </div>

                    {/* Portions & Temperature Badge */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs font-heading">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">পরিমাণ</span>
                        <span className="text-sm font-black text-emerald-700">
                          {listing.portions} {t.liveFeed.portions}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">সংরক্ষণ</span>
                        <span className="text-xs font-bold text-slate-700">
                          {lang === "bn" ? listing.tempBn : listing.tempEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Status & Modal Trigger */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">স্ট্যাটাস:</span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase font-heading",
                          listing.status === "enroute"
                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-300/40"
                            : listing.status === "claimed"
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-300/40"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300/40"
                        )}
                      >
                        {lang === "bn" ? listing.statusTextBn : listing.statusTextEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveListingModal(listing)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-black text-slate-800 shadow-2xs hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-all font-heading cursor-pointer"
                    >
                      {t.liveFeed.claimBtn} <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredListings.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center">
              <PackageCheck className="mx-auto size-10 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-slate-600">{t.liveFeed.emptyState}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedZone("all");
                  setSearchQuery("");
                }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                সব এলাকার তালিকা দেখুন
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Food Safety & Packaging Standards */}
      <section id="standards" className="border-t border-slate-200/90 bg-white py-20 sm:py-24">
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
                  alt="Sealed hygienic catering containers with Kacchi Biryani and Polao"
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
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
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
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
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
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  {t.standards.card3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW: Interactive Impact Calculator (ইমপ্যাক্ট ক্যালকুলেটর) */}
      <section id="calculator" className="py-20 sm:py-24 bg-gradient-to-br from-[#02241b] via-[#021f17] to-[#01140e] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 font-heading border border-emerald-400/30">
              <Calculator className="size-3.5 text-emerald-400" />
              {t.calculator.badge}
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl font-heading">
              {t.calculator.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
              {t.calculator.subtitle}
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-emerald-800/40 bg-emerald-950/60 p-6 sm:p-10 backdrop-blur-md shadow-2xl">
            {/* Interactive Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="meals-range" className="text-sm sm:text-base font-bold text-emerald-100 font-heading">
                  {t.calculator.sliderLabel}
                </label>
                <span className="rounded-xl bg-emerald-500/20 px-3 py-1 text-base sm:text-lg font-black text-amber-300 ring-1 ring-emerald-400/30 font-heading">
                  {impactMeals} {t.calculator.mealsUnit}
                </span>
              </div>

              <input
                id="meals-range"
                type="range"
                min="20"
                max="500"
                step="10"
                value={impactMeals}
                onChange={(e) => setImpactMeals(Number(e.target.value))}
                className="w-full h-2.5 bg-emerald-900/80 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />

              <div className="flex justify-between text-[11px] text-emerald-300/60 font-semibold font-mono">
                <span>২০ প্যাকেট / সপ্তাহ</span>
                <span>২৫০ প্যাকেট</span>
                <span>৫০০ প্যাকেট / সপ্তাহ</span>
              </div>
            </div>

            {/* Dynamic Results Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-900/40 p-4">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Utensils className="size-5" />
                </span>
                <p className="mt-3 text-2xl sm:text-3xl font-black text-white font-heading">
                  {calcMonthlyMeals.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-200/80 font-medium">
                  {t.calculator.monthlyMeals}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-900/40 p-4">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
                  <HeartHandshake className="size-5" />
                </span>
                <p className="mt-3 text-2xl sm:text-3xl font-black text-amber-300 font-heading">
                  {calcPeopleFed.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-200/80 font-medium">
                  {t.calculator.peopleFed}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-900/40 p-4">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-teal-500/20 text-teal-300">
                  <Leaf className="size-5" />
                </span>
                <p className="mt-3 text-2xl sm:text-3xl font-black text-teal-300 font-heading">
                  {calcCo2Saved.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-200/80 font-medium">
                  {t.calculator.co2Saved}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-900/40 p-4">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-sky-500/20 text-sky-300">
                  <Droplets className="size-5" />
                </span>
                <p className="mt-3 text-2xl sm:text-3xl font-black text-sky-300 font-heading">
                  {calcWaterSaved.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-emerald-200/80 font-medium">
                  {t.calculator.waterSaved}
                </p>
              </div>
            </div>

            {/* CTA action & Methodology Note */}
            <div className="mt-8 pt-6 border-t border-emerald-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-[11px] text-emerald-300/70 max-w-md font-normal leading-relaxed">
                {t.calculator.helper}
              </p>
              <Link
                href={ROUTES.auth.registerDonor}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-400 hover:to-teal-500 transition-all font-heading active:scale-95"
              >
                {t.calculator.ctaBtn} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Community Stories & Real-Life Impact */}
      <section id="impact" className="py-20 sm:py-24 bg-gradient-to-b from-[#01140e] to-[#021f17] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-300 font-heading border border-emerald-400/30">
              {t.stories.badge}
            </span>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl font-heading">
              {t.stories.title}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              {t.stories.subtitle}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Story 1 */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-800/40 bg-emerald-950/50 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-300" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-100 italic">
                  {t.stories.story1Quote}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-800/40 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 font-black">
                  UI
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-white">{t.stories.story1Author}</p>
                  <p className="text-[10px] text-emerald-300/70">{t.stories.story1Role}</p>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-800/40 bg-emerald-950/50 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-300" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-100 italic">
                  {t.stories.story2Quote}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-800/40 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300 font-black">
                  MF
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-white">{t.stories.story2Author}</p>
                  <p className="text-[10px] text-emerald-300/70">{t.stories.story2Role}</p>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-800/40 bg-emerald-950/50 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-300" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-100 italic">
                  {t.stories.story3Quote}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-800/40 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-500/20 text-teal-300 font-black">
                  TA
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-white">{t.stories.story3Author}</p>
                  <p className="text-[10px] text-emerald-300/70">{t.stories.story3Role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEW: Frequently Asked Questions (FAQ Accordion) */}
      <section id="faq" className="py-20 sm:py-24 bg-white border-t border-slate-200/90">
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
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal border-t border-slate-200/60 bg-white">
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
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-slate-400 font-heading">
            {t.partnersTitle}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 text-center">
            {t.partnersList.map((partner) => (
              <div
                key={partner}
                className="flex h-14 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-extrabold text-slate-700 shadow-2xs font-heading"
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
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-700 font-heading">
              <Link href={ROUTES.donor.dashboard} className="hover:text-emerald-700">{t.nav.donorPortal}</Link>
              <Link href={ROUTES.ngo.dashboard} className="hover:text-emerald-700">{t.nav.ngoPortal}</Link>
              <Link href={ROUTES.volunteer.dashboard} className="hover:text-emerald-700">{t.nav.volunteerPortal}</Link>
              <Link href={ROUTES.auth.login} className="hover:text-emerald-700">{t.nav.login}</Link>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
            <p>{t.footer.copyright}</p>
            <p className="font-semibold text-emerald-800 font-heading">{t.footer.helpline}</p>
          </div>
        </div>
      </footer>

      {/* Quick Claim Detail Modal */}
      {activeListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveListingModal(null)}
              className="absolute top-5 right-5 grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 font-heading ring-1 ring-emerald-600/20">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              {t.liveFeed.safetyBadge}
            </span>

            <h3 className="mt-3 text-xl font-black text-slate-900 font-heading">
              {lang === "bn" ? activeListingModal.titleBn : activeListingModal.titleEn}
            </h3>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">{t.liveFeed.modalDonor}</span>
                <span className="font-bold text-slate-900">{activeListingModal.donor}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">{t.liveFeed.modalLocation}</span>
                <span className="font-bold text-slate-900 text-right">
                  {lang === "bn" ? activeListingModal.locationBn : activeListingModal.locationEn}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">{t.liveFeed.modalCooked}</span>
                <span className="font-bold text-slate-900">
                  {lang === "bn" ? activeListingModal.cookTimeBn : activeListingModal.cookTimeEn}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">{t.liveFeed.modalSafeUntil}</span>
                <span className="font-bold text-emerald-700">
                  {activeListingModal.timeLeftMinutes} মি. বাকি
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">{t.liveFeed.modalTemp}</span>
                <span className="font-bold text-slate-900">
                  {lang === "bn" ? activeListingModal.tempBn : activeListingModal.tempEn}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={ROUTES.ngo.claims}
                onClick={() => setActiveListingModal(null)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 transition-all font-heading"
              >
                {t.liveFeed.modalActionNgo} <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveListingModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer font-heading"
              >
                {t.liveFeed.modalActionClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}