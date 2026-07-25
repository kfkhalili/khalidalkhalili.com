import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Nothing here is private, and `/_next/` has to stay crawlable or the CSS and
 * JS a renderer needs are blocked. So the file exists for one reason: to point
 * at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
