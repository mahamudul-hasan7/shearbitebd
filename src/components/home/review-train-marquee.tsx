"use client";

import { Star, ShieldCheck, MapPin, Quote, Sparkles, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  authorBn: string;
  authorEn: string;
  roleBn: string;
  roleEn: string;
  orgBn: string;
  orgEn: string;
  typeBadgeBn: string;
  typeBadgeEn: string;
  locationBn: string;
  locationEn: string;
  quoteBn: string;
  quoteEn: string;
  rating: number;
  initials: string;
  color: "emerald" | "amber" | "teal" | "blue" | "rose" | "purple" | "cyan";
  timeAgoBn: string;
  timeAgoEn: string;
}

const TRACK_1_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    authorBn: "আসিফ ইকবাল",
    authorEn: "Asif Iqbal",
    roleBn: "ক্যাফেটেরিয়া সুপারভাইজার",
    roleEn: "Cafeteria Supervisor",
    orgBn: "UIU Central Cafeteria",
    orgEn: "UIU Central Cafeteria",
    typeBadgeBn: "খাদ্য দাতা · ক্যাফেটেরিয়া",
    typeBadgeEn: "Donor · Cafeteria",
    locationBn: "মাদানী এভিনিউ, বাড্ডা",
    locationEn: "Madani Avenue, Badda",
    quoteBn: "আমাদের ক্যাফেটেরিয়ায় প্রতিদিন দুপুরের পর যে ফ্রেশ বিরিয়ানি ও কারি বেঁচে যেত, তা এখন মাত্র ২০ মিনিটের মধ্যে মাস্তুল সেন্টারে পৌঁছে যায়। খাদ্য অপচয় এখন আমাদের ক্যাম্পাসে শূন্য!",
    quoteEn: "The fresh meals left after lunchtime are now safely collected by Mastul Foundation in 20 minutes. Food wastage on our campus is officially down to zero!",
    rating: 5,
    initials: "UI",
    color: "emerald",
    timeAgoBn: "গতকাল",
    timeAgoEn: "Yesterday",
  },
  {
    id: "rev-2",
    authorBn: "ফারহানা আক্তার",
    authorEn: "Farhana Akter",
    roleBn: "শেল্টার কো-অর্ডিনেটর",
    roleEn: "Shelter Coordinator",
    orgBn: "মাস্তুল ফাউন্ডেশন",
    orgEn: "Mastul Foundation",
    typeBadgeBn: "নিবন্ধিত এনজিও",
    typeBadgeEn: "Verified NGO",
    locationBn: "ধানমন্ডি শাখা, ঢাকা",
    locationEn: "Dhanmondi Branch, Dhaka",
    quoteBn: "শিশুরা যখন সিল করা গরম কাচ্চি বা রোস্টের প্যাকেট পায়, তাদের মুখের সেই হাসি ভাষায় প্রকাশ করা যায় না। ডিজিটাল ওটিপি সিস্টেমের কারণে বিতরণ প্রক্রিয়া ১০০% স্বচ্ছ ও নিরাপদ।",
    quoteEn: "When children receive sealed warm meal boxes, the smiles on their faces are priceless. The digital OTP verification makes delivery 100% transparent and dignified.",
    rating: 5,
    initials: "MF",
    color: "amber",
    timeAgoBn: "আজ দুপুর",
    timeAgoEn: "Today Noon",
  },
  {
    id: "rev-3",
    authorBn: "তানভীর আহমেদ",
    authorEn: "Tanvir Ahmed",
    roleBn: "স্বেচ্ছাসেবক রাইডার",
    roleEn: "Volunteer Rider",
    orgBn: "ঢাকা মেট্রো ফিল্ড স্কোয়াড",
    orgEn: "Dhaka Metro Field Squad",
    typeBadgeBn: "ভলান্টিয়ার রাইডার",
    typeBadgeEn: "Volunteer Squad",
    locationBn: "হাতিরঝিল ও রামপুরা",
    locationEn: "Hatirjheel & Rampura",
    quoteBn: "বাইক নিয়ে হাতিরঝিল দিয়ে খাবার পৌঁছে দেওয়ার প্রতিটি মুহূর্তে মনে হয় দেশের মানুষের জন্য কিছু করছি। অ্যাপের লাইভ রুট গাইড ও কিউআর স্ক্যানার সত্যিই অনেক ফাস্ট ও প্রফেশনাল!",
    quoteEn: "Riding across Hatirjheel to deliver warm food makes me feel proud. The real-time route guide and QR verification scanner work blazingly fast!",
    rating: 5,
    initials: "TA",
    color: "teal",
    timeAgoBn: "২ ঘণ্টা আগে",
    timeAgoEn: "2 hours ago",
  },
  {
    id: "rev-4",
    authorBn: "মেজর (অব.) রফিকুল ইসলাম",
    authorEn: "Major (Retd.) Rafiqul Islam",
    roleBn: "ক্যাটারিং ইনচার্জ",
    roleEn: "Catering In-charge",
    orgBn: "সেনা কুঞ্জ কনভেনশন সেন্টার",
    orgEn: "Sena Kunja Convention",
    typeBadgeBn: "খাদ্য দাতা · ক্যাটারিং",
    typeBadgeEn: "Donor · Catering",
    locationBn: "ঢাকা সেনানিবাস",
    locationEn: "Dhaka Cantonment",
    quoteBn: "বিয়ে বা মেজবানের আয়োজনে শত শত মানুষের খাবার অতিরিক্ত থেকে যেত। ShareBite BD-র মাধ্যমে অনুষ্ঠান শেষ হওয়ার ৩০ মিনিটের মধ্যেই খাবার সিল প্যাক করে চ্যারিটিতে পৌঁছে যাচ্ছে।",
    quoteEn: "Weddings and banquets often have hundreds of surplus meals. Through ShareBite BD, within 30 minutes of event wrap-up, food is sealed and handed over safely.",
    rating: 5,
    initials: "SK",
    color: "blue",
    timeAgoBn: "৩ দিন আগে",
    timeAgoEn: "3 days ago",
  },
  {
    id: "rev-5",
    authorBn: "সাদিয়া মেহজাবিন",
    authorEn: "Sadia Mehzabin",
    roleBn: "প্রোগ্রাম লিড",
    roleEn: "Program Lead",
    orgBn: "বিদ্যানন্দ ফাউন্ডেশন",
    orgEn: "Bidyanondo Foundation",
    typeBadgeBn: "নিবন্ধিত এনজিও",
    typeBadgeEn: "Verified NGO",
    locationBn: "মিরপুর-১২ জোন",
    locationEn: "Mirpur-12 Zone",
    quoteBn: "আগে উদ্বৃত্ত খাবার খুঁজতে অনেক সময় নষ্ট হতো। এখন লাইভ বোর্ডে খাবারের তাপমাত্রা, পরিমাণ ও রান্নার সময় দেখে এক ক্লিকেই ক্লেইম করা যায়। অসাধারন একটি আধুনিক মানবিক প্ল্যাটফর্ম!",
    quoteEn: "Finding reliable surplus food used to take hours. Now we see thermal integrity, portions, and cooked time live, claiming in one tap. Truly an extraordinary humanitarian platform!",
    rating: 5,
    initials: "BF",
    color: "rose",
    timeAgoBn: "গতকাল",
    timeAgoEn: "Yesterday",
  },
];

const TRACK_2_REVIEWS: ReviewItem[] = [
  {
    id: "rev-6",
    authorBn: "মাহমুদুল হাসান",
    authorEn: "Mahamudul Hasan",
    roleBn: "শিক্ষার্থী ও সাইক্লিস্ট",
    roleEn: "Student & Cyclist",
    orgBn: "ব্র্যাক ইউনিভার্সিটি রেসকিউ টিম",
    orgEn: "BRACU Rescue Team",
    typeBadgeBn: "গ্রিন সাইক্লিস্ট ভলান্টিয়ার",
    typeBadgeEn: "Green Cyclist",
    locationBn: "মেরুল বাড্ডা ও আফতাবনগর",
    locationEn: "Merul Badda & Aftabnagar",
    quoteBn: "ক্লাস শেষে ক্যাম্পাসের আশেপাশে ১-২ ঘণ্টা সাইকেল চালিয়ে জরুরি খাবার পৌঁছে দেই। প্রতি সফল ডেলিভারিতে ডিজিটাল ভেরিফিকেশন সার্টিফিকেট পাই যা আমাদের মতো তরুণদের দারুণ অনুপ্রেরণা যোগায়।",
    quoteEn: "After classes, I spend 1-2 hours on my cycle rescuing warm meals. Every completed mission grants a digital verified certificate which keeps young students motivated.",
    rating: 5,
    initials: "MH",
    color: "purple",
    timeAgoBn: "আজ সকাল",
    timeAgoEn: "This Morning",
  },
  {
    id: "rev-7",
    authorBn: "শেফ কামরুল হাসান",
    authorEn: "Chef Kamrul Hasan",
    roleBn: "এক্সিকিউটিভ শেফ",
    roleEn: "Executive Chef",
    orgBn: "র‌্যাডিসন ব্লু ঢাকা ওয়াটার গার্ডেন",
    orgEn: "Radisson Blu Dhaka",
    typeBadgeBn: "খাদ্য দাতা · ৫-স্টার হোটেল",
    typeBadgeEn: "Donor · 5-Star Hotel",
    locationBn: "এয়ারপোর্ট রোড, কুর্মিটোলা",
    locationEn: "Airport Road, Kurmitola",
    quoteBn: "বাণিজ্যিক ফাইভ-স্টার মানের খাদ্য সুরক্ষা প্রোটোকল মেনে আমরা গরম খাবার ইনসুলেটেড বক্সে সিল করি। ShareBite BD প্ল্যাটফর্মের কোল্ড-চেইন মনিটরিং খাদ্য নিরাপত্তার সর্বোচ্চ মান বজায় রাখে।",
    quoteEn: "Adhering to 5-star commercial safety standards, we pack warm food in insulated thermal boxes. ShareBite BD’s cold-chain tracking preserves the highest safety standards.",
    rating: 5,
    initials: "RB",
    color: "amber",
    timeAgoBn: "৪ দিন আগে",
    timeAgoEn: "4 days ago",
  },
  {
    id: "rev-8",
    authorBn: "মোঃ জসিম উদ্দীন",
    authorEn: "Md. Jashim Uddin",
    roleBn: "কমিউনিটি সুপারভাইজার",
    roleEn: "Community Supervisor",
    orgBn: "কড়াইল পুনর্বাসন কেন্দ্র",
    orgEn: "Korail Community Shelter",
    typeBadgeBn: "সুবিধাভোগী প্রতিনিধি",
    typeBadgeEn: "Community Impact",
    locationBn: "কড়াইল, মহাখালী",
    locationEn: "Korail, Mohakhali",
    quoteBn: "আমাদের এলাকার অসহায় প্রবীণ ও পথশিশুরা প্রতিদিন দুপুরের পর পুষ্টিকর তাজা খাবার পাচ্ছে। খাবার প্যাকেটগুলো একদম ফ্রেশ ও স্বাস্থ্যসম্মতভাবে সিল করা থাকে।",
    quoteEn: "Vulnerable elderly and street children in our community receive nutritious fresh meals daily. The boxes are always fresh, hygienic, and neatly sealed.",
    rating: 5,
    initials: "JU",
    color: "cyan",
    timeAgoBn: "আজ দুপুর",
    timeAgoEn: "Today Noon",
  },
  {
    id: "rev-9",
    authorBn: "নুসরাত জাহান",
    authorEn: "Nusrat Jahan",
    roleBn: "এডুকেশন অ্যান্ড নিউট্রিশন অফিসার",
    roleEn: "Nutrition Officer",
    orgBn: "জাগো ফাউন্ডেশন",
    orgEn: "JAAGO Foundation",
    typeBadgeBn: "নিবন্ধিত চ্যারিটি",
    typeBadgeEn: "Verified Charity",
    locationBn: "রায়েরবাজার শাখা",
    locationEn: "Rayerbazar Branch",
    quoteBn: "সুবিধাবঞ্চিত শিশুদের স্কুলে পুষ্টিকর খাবার সরবরাহ করতে ShareBite আমাদের সবচেয়ে নির্ভরযোগ্য অংশীদার। খাদ্য বণ্টনের প্রতিটি ধাপ সিস্টেমে নিখুঁতভাবে অডিট করা থাকে।",
    quoteEn: "ShareBite BD is our most reliable partner in supplying nutritious food to underprivileged students. Every step of food distribution is immaculately audited.",
    rating: 5,
    initials: "JF",
    color: "rose",
    timeAgoBn: "গতকাল",
    timeAgoEn: "Yesterday",
  },
  {
    id: "rev-10",
    authorBn: "নাজমুল হুদা",
    authorEn: "Nazmul Huda",
    roleBn: "ফুড কোর্ট ইনচার্জ",
    roleEn: "Food Court In-charge",
    orgBn: "এআইইউবি স্টুডেন্ট ক্যাফেটেরিয়া",
    orgEn: "AIUB Student Cafeteria",
    typeBadgeBn: "খাদ্য দাতা · বিশ্ববিদ্যালয়",
    typeBadgeEn: "Donor · University",
    locationBn: "কুড়িল বিশ্বরোড, ঢাকা",
    locationEn: "Kuril Bishwa Road, Dhaka",
    quoteBn: "আগে ক্যাম্পাসে অতিরিক্ত খাবার ফেলে দেওয়া ছাড়া উপায় থাকত না। আজ সেই খাবার শত শত অভাবী মানুষের মুখে আহার তুলে দিচ্ছে। আমরা আনন্দিত এই সামাজিক নেটওয়ার্কের সদস্য হতে পেরে।",
    quoteEn: "We had no choice but to dispose of surplus food earlier. Today, that exact food feeds hundreds in need with honor. Proud to be a verified partner of this network.",
    rating: 5,
    initials: "AI",
    color: "emerald",
    timeAgoBn: "৫ দিন আগে",
    timeAgoEn: "5 days ago",
  },
];

const COLOR_MAP = {
  emerald: {
    avatar: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cardBorder: "border-emerald-800/40 hover:border-emerald-500/60",
  },
  amber: {
    avatar: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cardBorder: "border-amber-800/40 hover:border-amber-500/60",
  },
  teal: {
    avatar: "bg-teal-500/20 text-teal-300 ring-teal-500/30",
    badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    cardBorder: "border-teal-800/40 hover:border-teal-500/60",
  },
  blue: {
    avatar: "bg-blue-500/20 text-blue-300 ring-blue-500/30",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    cardBorder: "border-blue-800/40 hover:border-blue-500/60",
  },
  rose: {
    avatar: "bg-rose-500/20 text-rose-300 ring-rose-500/30",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    cardBorder: "border-rose-800/40 hover:border-rose-500/60",
  },
  purple: {
    avatar: "bg-purple-500/20 text-purple-300 ring-purple-500/30",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    cardBorder: "border-purple-800/40 hover:border-purple-500/60",
  },
  cyan: {
    avatar: "bg-cyan-500/20 text-cyan-300 ring-cyan-500/30",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    cardBorder: "border-cyan-800/40 hover:border-cyan-500/60",
  },
};

function ReviewCard({ item, isBn }: { item: ReviewItem; isBn: boolean }) {
  const styles = COLOR_MAP[item.color] || COLOR_MAP.emerald;

  return (
    <article
      tabIndex={0}
      aria-label={`${isBn ? item.authorBn : item.authorEn} এর রিভিউ`}
      className={cn(
        "group relative w-[310px] sm:w-[360px] md:w-[390px] shrink-0 rounded-2xl sm:rounded-3xl border bg-gradient-to-b from-emerald-950/70 via-slate-900/80 to-[#01140e]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl select-none flex flex-col justify-between cursor-default focus:outline-hidden focus:ring-2 focus:ring-emerald-400/50",
        styles.cardBorder
      )}
    >
      {/* Top Header: Badge, Stars & Time */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold font-heading border",
              styles.badge
            )}
          >
            <ShieldCheck className="size-3" />
            {isBn ? item.typeBadgeBn : item.typeBadgeEn}
          </span>

          <span className="text-[10px] font-medium text-slate-400">
            {isBn ? item.timeAgoBn : item.timeAgoEn}
          </span>
        </div>

        {/* 5-Star Rating */}
        <div className="mt-3 flex items-center gap-1 text-amber-400">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className="size-3.5 fill-amber-400" />
          ))}
          <span className="ml-1 text-[11px] font-extrabold text-amber-300 font-heading">
            5.0
          </span>
        </div>

        {/* Quote Content */}
        <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-emerald-100/90 font-normal">
          &ldquo;{isBn ? item.quoteBn : item.quoteEn}&rdquo;
        </p>
      </div>

      {/* Author Profile Footer */}
      <div className="mt-5 pt-4 border-t border-emerald-800/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl font-heading font-black text-xs ring-1 shadow-sm",
              styles.avatar
            )}
          >
            {item.initials}
          </span>
          <div className="min-w-0">
            <h4 className="font-heading text-xs sm:text-sm font-extrabold text-white truncate flex items-center gap-1">
              <span>{isBn ? item.authorBn : item.authorEn}</span>
              <span className="text-emerald-400 text-xs" title="Verified Member">✓</span>
            </h4>
            <p className="text-[11px] text-emerald-300/80 truncate font-medium">
              {isBn ? item.roleBn : item.roleEn} · <span className="text-slate-300 font-bold">{isBn ? item.orgBn : item.orgEn}</span>
            </p>
          </div>
        </div>

        <span className="shrink-0 text-[10px] text-slate-400 flex items-center gap-0.5">
          <MapPin className="size-3 text-emerald-400" />
          <span className="hidden sm:inline">{isBn ? item.locationBn.split(",")[0] : item.locationEn.split(",")[0]}</span>
        </span>
      </div>
    </article>
  );
}

export function ReviewTrainMarquee({ lang = "bn" }: { lang?: "bn" | "en" }) {
  const isBn = lang === "bn";

  // Duplicate arrays to achieve infinite seamless loop without jump
  const track1 = [...TRACK_1_REVIEWS, ...TRACK_1_REVIEWS];
  const track2 = [...TRACK_2_REVIEWS, ...TRACK_2_REVIEWS];

  return (
    <div className="relative w-full overflow-hidden py-4 space-y-4 sm:space-y-6">
      {/* Cinematic Gradient Fade Overlays on Left & Right Edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#01140e] via-[#01140e]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#021f17] via-[#021f17]/80 to-transparent z-10" />

      {/* Track 1: Smooth Continuous Leftward Train */}
      <div className="flex overflow-hidden">
        <div className="animate-train-left flex gap-4 sm:gap-6 pl-4">
          {track1.map((item, idx) => (
            <ReviewCard key={`t1-${item.id}-${idx}`} item={item} isBn={isBn} />
          ))}
        </div>
      </div>

      {/* Track 2: Smooth Continuous Rightward Train (Opposite Direction) */}
      <div className="flex overflow-hidden">
        <div className="animate-train-right flex gap-4 sm:gap-6 pl-4">
          {track2.map((item, idx) => (
            <ReviewCard key={`t2-${item.id}-${idx}`} item={item} isBn={isBn} />
          ))}
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <p className="text-center text-[11px] text-emerald-300/60 pt-2 flex items-center justify-center gap-1.5 select-none">
        <Sparkles className="size-3 text-amber-400 animate-pulse" />
        <span>
          {isBn
            ? "রিভিউটি পড়তে কার্ডের ওপর মাউস রাখুন অথবা মোবাইলে চেপে ধরে রাখুন (ট্রেন থামবে)"
            : "Hover or tap on any card to pause the train and read the review"}
        </span>
      </p>
    </div>
  );
}
