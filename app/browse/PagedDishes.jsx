"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const PER_PAGE = 3;

export default function PagedDishes() {
  // the page lives in the URL, so /browse?page=2 can be shared
  const page = Math.max(Number(useSearchParams().get("page")) || 1, 1);

  // keepPreviousData: page 1 stays on screen while page 2 loads (no flash)
  const { data, error, isLoading, isValidating } = useSWR(
    `/api/dishes?page=${page}&limit=${PER_PAGE}`,
    fetcher,
    { keepPreviousData: true }
  );

  if (error) return <p className="error">⚠ Could not load the dishes. Please try again.</p>;
  if (isLoading && !data) return <p className="loading">Loading dishes…</p>;

  return (
    <>
      <ul className={isValidating ? "paged updating" : "paged"}>
        {data.items.map((d) => (
          <li key={d.id} className="card">
            <Link href={`/menu/${d.id}`}>{d.name}</Link> — {d.price} ETB · {d.category}
          </li>
        ))}
      </ul>

      <nav className="pager" aria-label="Pages">
        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            href={`/browse?page=${n}`}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? "active" : undefined}
          >
            {n}
          </Link>
        ))}
      </nav>
      <p className="muted">
        Page {page} of {data.totalPages} · {data.total} dishes
      </p>
    </>
  );
}
