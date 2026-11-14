"use client";

import { useState } from "react";
import { Bike, Building2, MapPin, Pause, Play, Quote, Star, Utensils } from "lucide-react";
import { translateUiText } from "@/lib/i18n/ui-text";
import styles from "./review-train-marquee.module.css";

// Fictional demo profiles and comments, never endorsements from real organizations.
const reviews = [
  { nameBn: "আসিফ", nameEn: "Asif", role: "Food donor", organizationBn: "নমুনা ক্যাফেটেরিয়া", organizationEn: "Sample cafeteria", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "emerald", quoteBn: "খাবারের পরিমাণ আর নেওয়ার সময় একবার লিখে দিলেই এনজিওকে সংগ্রহের তথ্য জানানো সহজ হয়।", quoteEn: "Listing the food quantity and pickup time makes it easier to share collection details with an NGO." },
  { nameBn: "ফারহানা", nameEn: "Farhana", role: "NGO", organizationBn: "নমুনা খাবার বিতরণের দল", organizationEn: "Sample distribution team", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "amber", quoteBn: "খাবারের উপাদান আর তৈরির সময় একসঙ্গে দেখে নিজেদের বিতরণের পরিকল্পনা করা সুবিধার।", quoteEn: "Seeing ingredients and preparation times together helps us plan our food distribution." },
  { nameBn: "তানভীর", nameEn: "Tanvir", role: "Volunteer", organizationBn: "নমুনা স্বেচ্ছাসেবক দল", organizationEn: "Sample volunteer team", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "teal", quoteBn: "কোথা থেকে খাবার নেব, কোথায় পৌঁছাব আর কার সঙ্গে কথা বলব—সব এক জায়গায় থাকলে কাজ সহজ হয়।", quoteEn: "Having pickup details, the destination and contact information in one place makes delivery easier." },
  { nameBn: "রাফি", nameEn: "Rafi", role: "Food donor", organizationBn: "নমুনা অনুষ্ঠানের আয়োজক", organizationEn: "Sample event organizer", cityBn: "চট্টগ্রাম", cityEn: "Chattogram", tone: "blue", quoteBn: "অনুষ্ঠানের বাড়তি খাবার ফেলে না দিয়ে যাঁদের দরকার তাঁদের জন্য পোস্ট দেওয়ার ধারণাটা ভালো লেগেছে।", quoteEn: "I like the idea of posting extra event food for people who need it instead of letting it go to waste." },
  { nameBn: "সাদিয়া", nameEn: "Sadia", role: "NGO", organizationBn: "নমুনা সহায়তা সংস্থা", organizationEn: "Sample support organization", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "rose", quoteBn: "কতটা খাবার পেলাম আর কতজনকে দিলাম—আলাদা করে হিসাব রাখতে পারাটা কাজে লাগে।", quoteEn: "Keeping separate records of the food received and the people served is useful for our team." },
  { nameBn: "মাহমুদ", nameEn: "Mahmud", role: "Volunteer", organizationBn: "নমুনা ক্যাম্পাস স্বেচ্ছাসেবক", organizationEn: "Sample campus volunteer", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "purple", quoteBn: "ক্লাসের ফাঁকে সময় থাকলে খাবার পৌঁছানোর খোলা কাজ দেখে বেছে নেওয়ার সুযোগটা ভালো।", quoteEn: "Being able to choose an available food delivery task when I have time between classes is helpful." },
  { nameBn: "কামরুল", nameEn: "Kamrul", role: "Food donor", organizationBn: "নমুনা বেকারি", organizationEn: "Sample bakery", cityBn: "সিলেট", cityEn: "Sylhet", tone: "amber", quoteBn: "বাড়তি বেকারির খাবারের ছবি আর পরিমাণ দিলে সংস্থা আগে থেকেই বুঝতে পারে কী নিতে আসবে।", quoteEn: "Photos and quantities help an organization understand what bakery food it will collect." },
  { nameBn: "জসিম", nameEn: "Jasim", role: "NGO", organizationBn: "নমুনা কমিউনিটি দল", organizationEn: "Sample community team", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "cyan", quoteBn: "কতজনের কত বেলার খাবার দরকার জানিয়ে চাহিদা দেওয়া যায়। এতে প্রয়োজনটা স্পষ্ট করে বোঝানো সহজ।", quoteEn: "Posting how many meals and people we need to support makes our food requirements clearer." },
  { nameBn: "নুসরাত", nameEn: "Nusrat", role: "Volunteer", organizationBn: "নমুনা খাবার পৌঁছানোর দল", organizationEn: "Sample delivery team", cityBn: "চট্টগ্রাম", cityEn: "Chattogram", tone: "rose", quoteBn: "খাবার নেওয়া আর পৌঁছানোর সময় আলাদা কোড মিলিয়ে কাজ নিশ্চিত করার বিষয়টা ভালো লেগেছে।", quoteEn: "I like confirming pickup and delivery separately with their own handover codes." },
  { nameBn: "নাজমুল", nameEn: "Nazmul", role: "Food donor", organizationBn: "নমুনা রেস্তোরাঁ", organizationEn: "Sample restaurant", cityBn: "ঢাকা", cityEn: "Dhaka", tone: "emerald", quoteBn: "খাবারের অবস্থা, উপাদান আর নেওয়ার শেষ সময় স্পষ্ট করে দিলে দুই পক্ষের বোঝাপড়া ভালো হয়।", quoteEn: "Clear food condition, ingredient and pickup deadline information helps both sides coordinate." },
] as const;

type Review = typeof reviews[number];
const tones: Record<Review["tone"], string> = {
  emerald: "border-emerald-500/25 bg-emerald-500/15 text-emerald-300",
  amber: "border-amber-500/25 bg-amber-500/15 text-amber-300",
  teal: "border-teal-500/25 bg-teal-500/15 text-teal-300",
  blue: "border-blue-500/25 bg-blue-500/15 text-blue-300",
  rose: "border-rose-500/25 bg-rose-500/15 text-rose-300",
  purple: "border-purple-500/25 bg-purple-500/15 text-purple-300",
  cyan: "border-cyan-500/25 bg-cyan-500/15 text-cyan-300",
};

function ReviewCard({ item, lang, duplicate }: { item: Review; lang: "bn" | "en"; duplicate: boolean }) {
  const tx = (source: string) => translateUiText(lang, source);
  const name = lang === "bn" ? item.nameBn : item.nameEn;
  const Icon = item.role === "Food donor" ? Utensils : item.role === "NGO" ? Building2 : Bike;
  return <article className={styles.card} tabIndex={duplicate ? -1 : 0} data-demo-review={!duplicate ? "true" : undefined}>
    <div className={styles.topLine}>
      <span className={`${styles.roleBadge} ${tones[item.tone]}`}><Icon size={13} aria-hidden="true" />{tx(item.role)}</span>
      <span className={styles.demoBadge}>{tx("Demo review")}</span>
    </div>
    <div className={styles.rating}>
      <span aria-hidden="true" className={styles.stars}>{[0, 1, 2, 3, 4].map((star) => <Star size={14} key={star} fill="currentColor" />)}</span>
      <span>{lang === "bn" ? "৫.০" : "5.0"}</span><span className={styles.ratingNote}>{tx("Sample rating")}</span>
    </div>
    <blockquote className={styles.quote}><Quote size={19} aria-hidden="true" /><p>{lang === "bn" ? item.quoteBn : item.quoteEn}</p></blockquote>
    <div className={styles.profile}>
      <span className={`${styles.avatar} ${tones[item.tone]}`} aria-hidden="true">{name.charAt(0)}</span>
      <div className={styles.profileText}><h3>{name}</h3><p>{lang === "bn" ? item.organizationBn : item.organizationEn}</p></div>
      <span className={styles.location}><MapPin size={12} aria-hidden="true" />{lang === "bn" ? item.cityBn : item.cityEn}</span>
    </div>
  </article>;
}

export function ReviewTrainMarquee({ lang = "bn", compact = false }: { lang?: "bn" | "en"; compact?: boolean }) {
  const [paused, setPaused] = useState(false);
  const tx = (source: string) => translateUiText(lang, source);
  const rows = compact ? [reviews] : [reviews.slice(0, 5), reviews.slice(5)];
  return <div className={`${styles.root} ${compact ? styles.compact : ""}`} data-paused={paused} data-testid="demo-reviews">
    <div className={styles.controls}>
      <p>{tx("Fictional profiles and comments for the demo.")}</p>
      <button className={styles.pauseButton} type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
        {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{paused ? tx("Resume reviews") : tx("Pause reviews")}
      </button>
    </div>
    <div className={styles.window}>
      {rows.map((row, index) => <div className={`${styles.track} ${index === 1 ? styles.reverse : ""}`} key={index}>
        {[false, true].map((duplicate) => <div className={styles.group} key={String(duplicate)} aria-hidden={duplicate ? true : undefined}>
          {row.map((item) => <ReviewCard item={item} lang={lang} duplicate={duplicate} key={item.nameEn} />)}
        </div>)}
      </div>)}
    </div>
    <p className={styles.hint}>{tx("Pause the reviews to read, or hover over a card.")}</p>
  </div>;
}
