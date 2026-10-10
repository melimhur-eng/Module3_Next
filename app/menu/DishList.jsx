import Card from "@/components/Card";
import DishCard from "./DishCard";
import { FilterItem } from "./FilterShell";

// Server component. Not a route: only files named page.js become URLs.
export default function DishList({ dishes }) {
  return (
    <div>
      {dishes.map((d, i) => (
        <FilterItem key={d.id} category={d.category}>
          <Card>
            {/* the first photo is the largest thing on screen when the menu opens */}
            <DishCard dish={d} priority={i === 0} />
          </Card>
        </FilterItem>
      ))}
    </div>
  );
}
