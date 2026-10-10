"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = ["All", "Main", "Vegan", "Grill", "Dessert"];

// Not a route: only files named page.js inside app/ become URLs.
export default function CategoryBar() {
  const router = useRouter();
  const pathname = usePathname();
  const selected = useSearchParams().get("category") ?? "All";

  function select(c) {
    router.push(c === "All" ? "/menu" : `/menu?category=${c}`);
  }

  return (
    <div className="chips">
      {categories.map((c) => (
        <button
          key={c}
          // on a dish page no category is "selected"
          className={pathname === "/menu" && c === selected ? "chip active" : "chip"}
          onClick={() => select(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
