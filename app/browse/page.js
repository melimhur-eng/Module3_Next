import { Suspense } from "react";
import PagedDishes from "./PagedDishes";

export const metadata = {
  title: "All dishes",
  description: "Every dish Addis Eats delivers, three to a page, with prices in ETB.",
  // ?page=2 shows a slice of the same list
  alternates: { canonical: "/browse" },
};

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
