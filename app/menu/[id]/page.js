import Image from "next/image";
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

// Title, description and preview come from the dish itself, so every dish
// page is distinct. getDish is called here and in the page; both read the
// same data.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) return { title: "Dish not found" };

  const description = `${dish.name}, ${dish.price} ETB: ${dish.description}`;
  return {
    title: dish.name,
    description,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: { title: `${dish.name} · Addis Eats`, description, url: `/menu/${dish.id}` },
  };
}

// params arrives as a prop (in Next 15 it is a promise, so it is awaited)
export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();

  // Structured data for search engines, built from the same record the page
  // shows, so the name and the ETB price always match what people see.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    offers: { "@type": "Offer", price: dish.price, priceCurrency: "ETB" },
  };

  return (
    <section className="card">
      <Image
        className="dish-hero"
        src={`/images/dishes/${dish.id}.jpg`}
        alt={`A plate of ${dish.name}`}
        width={2400}
        height={1600}
        sizes="(max-width: 720px) 100vw, 656px"
      />
      <h1>
        {dish.name} {dish.spicy && <span className="badge">Spicy</span>}
      </h1>
      <p>{dish.description}</p>
      <p>Category: {dish.category}</p>
      <p className="total">{dish.price} ETB</p>
      <AddToOrder dish={dish} /> <Link href="/menu">Back to the menu</Link>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
