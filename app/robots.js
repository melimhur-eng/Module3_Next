import { SITE_URL } from "@/lib/site";

// Private and personal pages are not for search engines.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout", "/orders", "/kitchen", "/login", "/cart", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
