import { Suspense } from "react";
import { getDishes } from "@/lib/dishes";
import DishList from "./DishList";
import FilterShell from "./FilterShell";
import MenuLoading from "./loading";

export const metadata = { title: "Menu · Addis Eats" };

// The menu changes a few times a day at most, so the page is built once and
// refreshed in the background at most once an hour (incremental regeneration).
export const revalidate = 3600;

// A server component: it awaits its data directly. No useFetch, no loading or
// error state here; loading.js and error.js cover those.
export default async function MenuPage() {
  const dishes = await getDishes();
  const index = dishes.map(({ id, name, category }) => ({ id, name, category }));

  return (
    <Suspense fallback={<MenuLoading />}>
      {/* FilterShell is a client component; the server-rendered list is passed
          in as children, so DishList itself never ships to the browser. */}
      <FilterShell index={index}>
        <DishList dishes={dishes} />
      </FilterShell>
    </Suspense>
  );
}
