import { Suspense } from "react";
import Menu from "./Menu";
import MenuLoading from "./loading";

export const metadata = { title: "Menu · Addis Eats" };

// The menu changes a few times a day at most, so the page is built once and
// refreshed in the background at most once an hour (incremental regeneration).
export const revalidate = 3600;

export default function MenuPage() {
  // The sidebar in layout.js renders straight away; the dish list streams in
  // behind this Suspense boundary.
  return (
    <Suspense fallback={<MenuLoading />}>
      <Menu />
    </Suspense>
  );
}
