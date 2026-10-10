"use client";

import { createContext, Suspense, useContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/lib/useDebounce";

// Split into its own chunk: downloaded the first time someone types.
const SearchResults = dynamic(() => import("./SearchResults"), {
  loading: () => <p className="loading">Searching…</p>,
});

const FilterContext = createContext("All");

// Owns the search box. With no search term, the server-rendered dish cards
// (children) are shown, filtered by category. With a term, results come from
// GET /api/dishes?q=…
export default function FilterShell({ index, children }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  // wait until typing pauses, so "tibs" sends one request, not four
  const term = useDebounce(search.trim(), 300);

  // the input only exists in the DOM after the first render, so focus it in an effect
  useEffect(() => {
    searchRef.current.focus();
  }, []);

  return (
    <section>
      <h1>Menu</h1>
      <input
        ref={searchRef}
        className="search"
        type="search"
        placeholder="Search all dishes"
        aria-label="Search all dishes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search.trim() === "" ? (
        // Reading ?category= (useSearchParams) on a static page makes React skip
        // server rendering up to the nearest Suspense boundary. The fallback is
        // the full list, so the server HTML always contains every dish, and the
        // category filter is applied once the page is running in the browser.
        <Suspense fallback={children}>
          <CategoryFilter index={index}>{children}</CategoryFilter>
        </Suspense>
      ) : (
        <SearchResults term={term} />
      )}
    </section>
  );
}

function CategoryFilter({ index, children }) {
  const params = useSearchParams();
  const category = params.get("category") ?? "All";

  // /menu?crash=1 makes the menu throw while rendering, to show app/menu/error.js
  if (params.has("crash")) throw new Error("Simulated crash while rendering the menu");

  const inCategory = index.filter((d) => category === "All" || d.category === category).length;
  return (
    <>
      <FilterContext.Provider value={category}>{children}</FilterContext.Provider>
      {inCategory === 0 && <p className="empty">No dishes in this category yet.</p>}
    </>
  );
}

// Wraps each server-rendered card; hides it when it is not in the chosen category.
export function FilterItem({ category, children }) {
  const selected = useContext(FilterContext);
  return selected === "All" || selected === category ? children : null;
}
