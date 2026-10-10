"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import DishList from "./DishList";
import { useCartStore } from "@/lib/cartStore";
import { useFetch } from "@/lib/useFetch";

export default function Menu() {
  // the category lives in the URL, so /menu?category=Vegan can be shared
  const category = useSearchParams().get("category") ?? "All";
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const addItem = useCartStore((s) => s.addItem);
  const { data, loading, error } = useFetch("/dishes.json");

  const shown = (data ?? []).filter(
    (d) =>
      (category === "All" || d.category === category) &&
      d.name.toLowerCase().includes(search.toLowerCase())
  );

  // the input only exists in the DOM after the first render, so focus it in an effect
  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <section>
      <h2>Menu</h2>
      <input
        ref={searchRef}
        className="search"
        type="search"
        placeholder="Search dishes"
        aria-label="Search dishes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <DishList dishes={shown} loading={loading} error={error} onAdd={addItem} />
    </section>
  );
}
