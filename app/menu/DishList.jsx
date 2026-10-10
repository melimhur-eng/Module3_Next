import Card from "@/components/Card";
import DishCard from "./DishCard";
import { FilterItem } from "./FilterShell";

// Server component. Not a route: only files named page.js become URLs.
export default function DishList({ dishes }) {
  return (
    <div>
      {dishes.map((d) => (
        <FilterItem key={d.id} name={d.name} category={d.category}>
          <Card>
            <DishCard dish={d} />
          </Card>
        </FilterItem>
      ))}
    </div>
  );
}
