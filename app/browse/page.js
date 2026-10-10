import { Suspense } from "react";
import PagedDishes from "./PagedDishes";

export const metadata = { title: "All dishes · Addis Eats" };

// A static shell; the pages of dishes are fetched in the browser.
export default function BrowsePage() {
  return (
    <section>
      <h1>All dishes</h1>
      <Suspense fallback={<p className="loading">Loading dishes…</p>}>
        <PagedDishes />
      </Suspense>
    </section>
  );
}
