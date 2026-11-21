import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/g/", "/me", "/join/", "/auth/", "/groups/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
