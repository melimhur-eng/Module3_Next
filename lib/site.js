// The site's public address, used for absolute links in social previews, the
// sitemap and robots.txt. Set NEXT_PUBLIC_SITE_URL to the production URL.
// On Vercel the production domain is provided automatically as a fallback.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
