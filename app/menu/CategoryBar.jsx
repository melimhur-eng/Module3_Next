"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = ["All", "Main", "Vegan", "Grill", "Dessert"];

// Reads the selected category from the URL. Used inside <Suspense>, whose
// fallback (CategoryButtons with nothing selected) is what the server sends.
export default function CategoryBar() {
  const pathname = usePathname();
  const selected = useSearchParams().get("category") ?? "All";
  // on a dish page no category is "selected"
  return <CategoryButtons selected={pathname === "/menu" ? selected : null} />;
}

// Not a route: only files named page.js inside app/ become URLs.
export function CategoryButtons({ selected }) {
  const router = useRouter();

  function select(c) {
    router.push(c === "All" ? "/menu" : `/menu?category=${c}`);
  }

  return (
    <div className="chips">
      {categories.map((c) => (
        <button
          key={c}
          className={c === selected ? "chip active" : "chip"}
          onClick={() => select(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
