import Link from "next/link";
import { notFound } from "next/navigation";
import { getDish, getDishes } from "@/lib/dishes";
import AddToOrder from "./AddToOrder";

// Every dish is known at build time, so one HTML page is generated per dish.
// Any other id is answered with a real 404 straight away, instead of being
// rendered on demand (where streaming would already have sent a 200 status).
export const dynamicParams = false;

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((d) => ({ id: d.id }));
}

// params arrives as a prop (in Next 15 it is a promise, so it is awaited)
export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();

  return (
    <section className="card">
      <h2>
        {dish.name} {dish.spicy && <span className="badge">Spicy</span>}
      </h2>
      <p>Category: {dish.category}</p>
      <p className="total">{dish.price} ETB</p>
      <AddToOrder dish={dish} /> <Link href="/menu">Back to the menu</Link>
    </section>
  );
}
