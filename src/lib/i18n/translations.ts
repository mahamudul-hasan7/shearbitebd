export type Language = "bn" | "en";

export interface Translations {
  nav: {
    radar: string;
    howItWorks: string;
    safety: string;
    partners: string;
    login: string;
    joinNetwork: string;
    donorPortal: string;
    ngoPortal: string;
    nationalTech: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titleHighlight: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    popularZonesLabel: string;
    popularZones: string;
    urgentTag: string;
    demoLabel: string;
    donorDemoBtn: string;
    ngoDemoBtn: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
  };
  partners: {
    title: string;
  };
  community: {
    badge: string;
    title: string;
    description: string;
    bullet1Title: string;
    bullet1Desc: string;
    bullet2Title: string;
    bullet2Desc: string;
  };
  standards: {
    badge: string;
    title: string;
    subtitle: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
  };
  cta: {
    title: string;
    description: string;
    donorBtn: string;
    ngoBtn: string;
  };
  footer: {
    copyright: string;
  };
}

export const translations: Record<Language, Translations> = {
  bn: {
    nav: {
      radar: "লাইভ রেডার",
      howItWorks: "উদ্ধার প্রক্রিয়া",
      safety: "খাদ্য নিরাপত্তা",
      partners: "এনজিও ও পার্টনার্স",
      login: "লগইন করুন",
      joinNetwork: "যুক্ত হোন",
      donorPortal: "ডোনার পোর্টাল",
      ngoPortal: "এনজিও পোর্টাল",
      nationalTech: "জাতীয় সিভিক টেক · বাংলাদেশ",
    },
    hero: {
      badge: "স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক · বাংলাদেশ",
      titlePart1: "অতিরিক্ত খাবার নষ্ট নয়, ",
      titleHighlight: "সম্মানের সাথে মানুষের পাতে।",
      subtitle:
        "ঢাকাসহ সারাদেশে বিশ্ববিদ্যালয় ক্যাফেটেরিয়া (UIU, BRACU), কমিউনিটি সেন্টারের মেজবান এবং রেস্তোরাঁর তাজা উদ্বৃত্ত খাবার পৌঁছে যাচ্ছে বিদ্যানন্দ, মাস্তুল ফাউন্ডেশন সহ নিবন্ধিত দাতব্য সংস্থায়—রিয়েল-টাইম ট্র্যাকিং ও কিউআর ভেরিফিকেশনের মাধ্যমে।",
      searchPlaceholder: "এলাকা দিন (যেমন: গুলশান, ধানমন্ডি, বাড্ডা...)",
      searchButton: "খাবার পোস্ট / দাবি করুন",
      popularZonesLabel: "জনপ্রিয় জোন:",
      popularZones: "গুলশান ১ ও ২ · ধানমন্ডি ২৭ · বাড্ডা UIU ক্যাম্পাস",
      urgentTag: "⚡ ১৫ মিনিটে জরুরি রেসকিউ",
      demoLabel: "সরাসরি ডেমো পোর্টাল:",
      donorDemoBtn: "ফুড ডোনার ড্যাশবোর্ড",
      ngoDemoBtn: "এনজিও ড্যাশবোর্ড",
      stat1Value: "৪,৩৪০+",
      stat1Label: "আজকের উদ্ধারকৃত মিল",
      stat2Value: "৮৫+",
      stat2Label: "নিবন্ধিত চ্যারিটি কিচেন",
      stat3Value: "<১৮ মিনিট",
      stat3Label: "গড় ঢাকা রেসকিউ সময়",
    },
    partners: {
      title: "বাংলাদেশের শীর্ষ ক্যাফেটেরিয়া, রেস্তোরাঁ ও দাতব্য অংশীদার",
    },
    community: {
      badge: "মর্যাদাপূর্ণ মানবিক খাদ্য বণ্টন",
      title: "যেখানে প্রতিটি খাবারের প্যাকেটের পেছনে রয়েছে ভালোবাসা ও নিষ্ঠা",
      description:
        "ঢাকায় প্রতিদিন প্রায় কয়েক হাজার কেজি তাজা রান্না করা খাবার বিভিন্ন কর্পোরেট অফিস ও বিয়ের অনুষ্ঠান থেকে উদ্বৃত্ত থাকে। ShareBite BD-র মাধ্যমে এই খাবারগুলো নষ্ট না করে সর্বোচ্চ হাইজিন মেনে সিলড বক্সে প্যাকেজিং করে সঠিক মানুষের কাছে পৌঁছে দেওয়া হয়।",
      bullet1Title: "১০০% ডিজিটাল কিউআর হ্যান্ডওভার",
      bullet1Desc:
        "দাতা ও গ্রহীতার মধ্যে ক্রিপ্টোগ্রাফিক কিউআর স্ক্যানের মাধ্যমে খাদ্য হস্তান্তর রেকর্ড করা হয়—যাতে জবাবদিহিতা নিশ্চিত থাকে।",
      bullet2Title: "অটোমেটেড এক্সপায়ারি ও টেম্পারেচার অ্যালার্ট",
      bullet2Desc:
        "রান্না করার সময় এবং খাদ্য সংরক্ষণের ধরন অনুযায়ী স্বয়ংক্রিয় সেফ পিকআপ ডেডলাইন হিসাব করা হয়।",
    },
    standards: {
      badge: "খাদ্য নিরাপত্তা ও স্বাস্থ্যবিধি",
      title: "বাণিজ্যিক ফুড-গ্রেড স্ট্যান্ডার্ড ও সিলড প্যাকেজিং",
      subtitle:
        "আমরা নিশ্চিত করি যে কোনো উদ্বৃত্ত খাবার যেন তার গুণমান ও সতেজতা বজায় রেখে সর্বোচ্চ মর্যাদায় পরিবেশন করা হয়।",
      card1Badge: "হাইজিন সিল প্রোটোকল",
      card1Title: "স্টেইনলেস স্টিল ও ইকো-ফ্রেন্ডলি বক্স",
      card1Desc:
        "কাচ্চি বিরিয়ানি, পোলাও, সবজি এবং ডাল প্রতিটি খাবার ফুড-গ্রেড ইনসুলেটেড কনটেইনার ও সিলড ক্রাফট পেপার বক্সে স্থানান্তর করা হয়।",
      card2Badge: "তাপমাত্রা নিয়ন্ত্রণ",
      card2Title: "গরম ও ঠান্ডা খাবারের পৃথক ব্যবস্থাপনা",
      card2Desc:
        "গরম খাবার ৬০°C-এর উপরে এবং বেকারি বা ফ্রেশ ফলমূল স্বাভাবিক স্বাস্থ্যকর আর্দ্রতায় ডেলিভারি করা হয়।",
      card3Badge: "দায়বদ্ধতা ও ট্র্যাকিং",
      card3Title: "সিএসআর ও ইএসজি সার্টিফিকেট",
      card3Desc:
        "অংশগ্রহণকারী রেস্তোরাঁ ও ক্যাফেটেরিয়া প্রতি মাসে খাদ্যের অপচয় রোধ ও কার্বন ফুটপ্রিন্ট হ্রাসের জন্য অফিসিয়াল সার্টিফিকেট লাভ করে।",
    },
    cta: {
      title: "আজ কি আপনার ক্যাফেটেরিয়া বা অনুষ্ঠানে খাবার উদ্বৃত্ত রয়েছে?",
      description:
        "ShareBite BD নেটওয়ার্কে মাত্র ২ মিনিটে উদ্বৃত্ত খাবার পোস্ট করুন। আপনার কাছাকাছি নিবন্ধিত এনজিওরা এসে সম্মানের সাথে তা সংগ্রহ করে পৌঁছে দেবে।",
      donorBtn: "খাদ্য দাতা হিসেবে যুক্ত হোন",
      ngoBtn: "নিবন্ধিত এনজিও হিসেবে আবেদন করুন",
    },
    footer: {
      copyright: "© ২০২৬ ShareBite BD. জাতীয় স্মার্ট উদ্বৃত্ত খাদ্য উদ্ধার ও বণ্টন নেটওয়ার্ক।",
    },
  },
  en: {
    nav: {
      radar: "Live Radar",
      howItWorks: "How It Works",
      safety: "Food Safety",
      partners: "NGOs & Partners",
      login: "Sign In",
      joinNetwork: "Join Network",
      donorPortal: "Donor Portal",
      ngoPortal: "NGO Portal",
      nationalTech: "National Civic Tech · Bangladesh",
    },
    hero: {
      badge: "Smart Surplus Food Rescue Network · Bangladesh",
      titlePart1: "Rescue surplus food. ",
      titleHighlight: "Feed Bangladesh communities.",
      subtitle:
        "Connecting university cafeterias (UIU, BRACU), wedding caterers, and premier restaurants with verified charities like Bidyanondo and Mastul Foundation with real-time tracking and verified QR handovers.",
      searchPlaceholder: "Enter area: e.g. Gulshan, Dhanmondi, Badda...",
      searchButton: "Post / Claim Food",
      popularZonesLabel: "Popular Zones:",
      popularZones: "Gulshan 1 & 2 · Dhanmondi 27 · Badda UIU Campus",
      urgentTag: "⚡ 15-Min Rapid Rescue",
      demoLabel: "Direct Demo Portals:",
      donorDemoBtn: "Food Donor Dashboard",
      ngoDemoBtn: "NGO Dashboard",
      stat1Value: "4,340+",
      stat1Label: "Meals Rescued Today",
      stat2Value: "85+",
      stat2Label: "Verified Charity Kitchens",
      stat3Value: "<18 min",
      stat3Label: "Avg. Dhaka Dispatch Time",
    },
    partners: {
      title: "Trusted by Bangladesh's Top Cafeterias, Caterers & Charities",
    },
    community: {
      badge: "Dignified Humanitarian Food Distribution",
      title: "Where Every Meal Carries Dignity, Love & Care",
      description:
        "Thousands of kilograms of fresh, edible food from catered weddings and corporate cafeterias go surplus daily in Dhaka. ShareBite BD rescues this food with strict temperature adherence and sealed packaging, delivering it to communities in need.",
      bullet1Title: "100% Cryptographic QR Handover",
      bullet1Desc:
        "Donors and receivers verify food transfer via encrypted QR code scans, ensuring complete chain-of-custody accountability.",
      bullet2Title: "Automated Expiry & Cold-Chain Tracking",
      bullet2Desc:
        "Safe pickup windows are calculated dynamically using cooking timestamps, humidity, and ambient temperature guidelines.",
    },
    standards: {
      badge: "Food Safety & Standards",
      title: "Commercial Food-Grade Safety & Sealed Packaging",
      subtitle:
        "We ensure that all surplus meals are transferred with peak nutritional freshness, hygienic dignity, and strict safety standards.",
      card1Badge: "Hygiene Seal Protocol",
      card1Title: "Stainless Steel & Eco-Friendly Boxes",
      card1Desc:
        "Authentic Kacchi Biryani, Chicken Polao, fresh vegetables, and lentils are sealed in insulated food-grade containers.",
      card2Badge: "Thermal Integrity",
      card2Title: "Dedicated Hot & Cold Chain Routing",
      card2Desc:
        "Hot food stays above 60°C, while fresh bakery and produce travel in ventilated, temperature-controlled transit bags.",
      card3Badge: "Traceability & Impact",
      card3Title: "Official CSR & ESG Certification",
      card3Desc:
        "Participating restaurants and universities receive monthly verified audits of food waste diversion and carbon offset impact.",
    },
    cta: {
      title: "Do you have surplus food at your cafeteria or event today?",
      description:
        "List extra food in under 2 minutes. Nearby verified NGOs will swiftly coordinate hygienic pickup and dignified delivery.",
      donorBtn: "Register as Food Donor",
      ngoBtn: "Apply as Verified NGO",
    },
    footer: {
      copyright: "© 2026 ShareBite BD. Smart Surplus Food Rescue Platform for Bangladesh.",
    },
  },
};
