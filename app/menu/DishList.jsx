import Card from "@/components/Card";
import Dish from "./Dish";

// Not a route: only files named page.js inside app/ become URLs.
export default function DishList({ dishes, loading, error, onAdd }) {
  if (loading) return <p className="loading">Loading the menu…</p>;
  if (error) return <p className="error">{error}</p>;
  if (dishes.length === 0) {
    return <p className="empty">No dishes in this category yet.</p>;
  }

  return (
    <div>
      {dishes.map((d) => (
        <Card key={d.id}>
          <Dish dish={d} onAdd={onAdd} />
        </Card>
      ))}
    </div>
  );
}
