import { getDishes } from "@/lib/dishes";
import { SITE_URL } from "@/lib/site";

// Built from the real menu at build time: a new dish appears here without
// anyone editing a file. Only public pages are listed — nothing behind sign-in.
export default async function sitemap() {
  const dishes = await getDishes();

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.5 },
    ...dishes.map((d) => ({
      url: `${SITE_URL}/menu/${d.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
