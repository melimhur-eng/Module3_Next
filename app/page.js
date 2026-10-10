import Link from "next/link";
import { getDishes } from "@/lib/dishes";

// Today's specials change at most daily; regenerate the page at most every hour.
export const revalidate = 3600;

export default async function HomePage() {
  const dishes = await getDishes();
  const specials = dishes.filter((d) => d.spicy).slice(0, 3);

  return (
    <>
      <img className="hero" src="/images/hero.jpg" alt="A plate of Ethiopian food from Addis Eats" />
      <section>
        <h2>Today’s specials</h2>
        <ul className="specials">
          {specials.map((d) => (
            <li key={d.id}>
              <Link href={`/menu/${d.id}`}>{d.name}</Link> — {d.price} ETB
            </li>
          ))}
        </ul>
      </section>
      <Link className="cta" href="/menu">
        See the full menu →
      </Link>
    </>
  );
}
