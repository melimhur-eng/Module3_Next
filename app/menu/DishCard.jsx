import Link from "next/link";
import DishActions from "./DishActions";

// Server component: plain markup, no JavaScript sent for it.
export default function DishCard({ dish }) {
  return (
    <div className="dish">
      <img className="dish-photo" src={`/images/dishes/${dish.id}.jpg`} alt={dish.name} />
      <h3>
        <Link href={`/menu/${dish.id}`}>{dish.name}</Link>{" "}
        {dish.spicy === true && <span className="badge">Spicy</span>}
      </h3>
      <p>{dish.price} ETB</p>
      <DishActions dish={dish} />
    </div>
  );
}
