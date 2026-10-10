"use client";

import { useRouter } from "next/navigation";

const categories = ["All", "Main", "Vegan", "Grill", "Dessert"];

// Not a route: only files named page.js inside app/ become URLs.
export default function CategoryBar({ selected }) {
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
