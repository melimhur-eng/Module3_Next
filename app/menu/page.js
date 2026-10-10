import { Suspense } from "react";
import Menu from "./Menu";

export const metadata = { title: "Menu · Addis Eats" };

export default function MenuPage() {
  // Menu reads the query string with useSearchParams, which needs a Suspense boundary
  return (
    <Suspense fallback={<p className="loading">Loading the menu…</p>}>
      <Menu />
    </Suspense>
  );
}
