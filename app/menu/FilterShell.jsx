"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import Card from "@/components/Card";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/lib/useDebounce";
import DishActions from "./DishActions";

const FilterContext = createContext("All");

// Owns the search box and reads the category from the URL. With no search
// term, the server-rendered dish cards (children) are shown, filtered by
// category. With a term, results come from GET /api/dishes?q=…
export default function FilterShell({ index, children }) {
  const category = useSearchParams().get("category") ?? "All";
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);

  // wait until typing pauses, so "tibs" sends one request, not four
  const term = useDebounce(search.trim(), 300);
  // a null key means "don't fetch": nothing is requested for an empty box
  const key = term ? `/api/dishes?q=${encodeURIComponent(term)}` : null;
  // keepPreviousData: while the next search loads, keep showing the last results
  const { data: results, error, isLoading, isValidating } = useSWR(key, fetcher, {
    keepPreviousData: true,
  });

  const inCategory = index.filter((d) => category === "All" || d.category === category).length;

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
        placeholder="Search all dishes"
        aria-label="Search all dishes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search.trim() === "" ? (
        <>
          <FilterContext.Provider value={category}>{children}</FilterContext.Provider>
          {inCategory === 0 && <p className="empty">No dishes in this category yet.</p>}
        </>
      ) : (
        <div aria-live="polite" className={isValidating ? "updating" : undefined}>
          {error && <p className="error">⚠ Search is unavailable right now. Please try again.</p>}
          {!results && isLoading && <p className="loading">Searching…</p>}
          {results && results.length === 0 && (
            <p className="empty">No dishes match “{term}”.</p>
          )}
          {results?.map((d) => (
            <Card key={d.id}>
              <div className="dish">
                <h3>
                  <Link href={`/menu/${d.id}`}>{d.name}</Link>{" "}
                  {d.spicy === true && <span className="badge">Spicy</span>}
                </h3>
                <p>{d.price} ETB</p>
                <DishActions dish={d} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

// Wraps each server-rendered card; hides it when it is not in the chosen category.
export function FilterItem({ category, children }) {
  const selected = useContext(FilterContext);
  return selected === "All" || selected === category ? children : null;
}
