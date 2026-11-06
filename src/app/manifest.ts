import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShareBite BD — স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক",
    short_name: "ShareBite BD",
    description: "বাংলাদেশের ক্যাফেটেরিয়া ও রেস্তোরাঁর উদ্বৃত্ত খাবার দ্রুততম সময়ে অভাবী মানুষের কাছে পৌঁছে দেওয়ার প্ল্যাটফর্ম।",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#059669",
    icons: [
      {
        src: "/brand/brand-mark.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
