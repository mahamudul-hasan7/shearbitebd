import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sharebitebd.org";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/onboarding"],
        disallow: ["/donor/", "/ngo/", "/volunteer/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
