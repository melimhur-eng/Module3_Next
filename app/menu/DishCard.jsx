import Image from "next/image";
import Link from "next/link";
import DishActions from "./DishActions";

// Server component: plain markup, no JavaScript sent for it.
export default function DishCard({ dish }) {
  return (
    <div className="dish">
      <Image
        className="dish-photo"
        src={`/images/dishes/${dish.id}.jpg`}
        alt={`A plate of ${dish.name}`}
        width={2400}
        height={1600}
        sizes="160px" // the thumbnail is always 160px wide
      />
      <h3>
        <Link href={`/menu/${dish.id}`}>{dish.name}</Link>{" "}
        {dish.spicy === true && <span className="badge">Spicy</span>}
      </h3>
      <p>{dish.price} ETB</p>
      <DishActions dish={dish} />
    </div>
  );
}
