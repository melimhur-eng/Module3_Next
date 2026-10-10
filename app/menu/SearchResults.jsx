"use client";

import Link from "next/link";
import useSWR from "swr";
import Card from "@/components/Card";
import { fetcher } from "@/lib/fetcher";
import DishActions from "./DishActions";

// Loaded only once someone starts typing (see FilterShell), so SWR and this
// component are not part of the menu's first download.
export default function SearchResults({ term }) {
  // a null key means "don't fetch": nothing is requested until the debounced term exists
  const key = term ? `/api/dishes?q=${encodeURIComponent(term)}` : null;
  // keepPreviousData: while the next search loads, keep showing the last results
  const { data: results, error, isLoading, isValidating } = useSWR(key, fetcher, {
    keepPreviousData: true,
  });

  return (
    <div aria-live="polite" className={isValidating ? "updating" : undefined}>
      {error && <p className="error">⚠ Search is unavailable right now. Please try again.</p>}
      {!results && (isLoading || !term) && <p className="loading">Searching…</p>}
      {results && results.length === 0 && <p className="empty">No dishes match “{term}”.</p>}
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
  );
}
