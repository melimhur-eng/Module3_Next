import { getDishes } from "@/lib/dishes";
import DishList from "./DishList";
import FilterShell from "./FilterShell";

export const metadata = {
  title: "Menu",
  description:
    "The full Addis Eats menu with prices in ETB: Doro Wat, Kitfo, Tibs, Shiro, Misir Wat and more. Filter by Main, Vegan or Grill.",
  // ?category=Vegan is the same page to a search engine
  alternates: { canonical: "/menu" },
};

// The menu changes a few times a day at most, so the page is built once and
// refreshed in the background at most once an hour (incremental regeneration).
export const revalidate = 3600;

// A server component: it awaits its data directly. No useFetch, no loading or
// error state here; loading.js and error.js cover those.
export default async function MenuPage() {
  const dishes = await getDishes();
  const index = dishes.map(({ id, name, category }) => ({ id, name, category }));

  // FilterShell is a client component; the server-rendered list is passed in
  // as children, so DishList itself never ships to the browser.
  return (
    <FilterShell index={index}>
      <DishList dishes={dishes} />
    </FilterShell>
  );
}
