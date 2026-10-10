"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const FilterContext = createContext({ search: "", category: "All" });

function matches(dish, { search, category }) {
  return (
    (category === "All" || dish.category === category) &&
    dish.name.toLowerCase().includes(search.toLowerCase())
  );
}

// Owns the search box and reads the category from the URL. The dish cards are
// rendered on the server and arrive as children; each one is wrapped in a
// FilterItem that hides itself when it does not match.
export default function FilterShell({ index, children }) {
  const category = useSearchParams().get("category") ?? "All";
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const filter = { search, category };
  const visible = index.filter((d) => matches(d, filter)).length;

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
      <FilterContext.Provider value={filter}>{children}</FilterContext.Provider>
      {visible === 0 && <p className="empty">No dishes match — try another category.</p>}
    </section>
  );
}

export function FilterItem({ name, category, children }) {
  const filter = useContext(FilterContext);
  return matches({ name, category }, filter) ? children : null;
}
