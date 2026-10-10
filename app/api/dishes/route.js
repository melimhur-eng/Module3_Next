import { getDishes } from "@/lib/dishes";

// GET /api/dishes            -> 200, every dish
// GET /api/dishes?category=X -> 200, only that category (possibly empty)
export async function GET(request) {
  const category = new URL(request.url).searchParams.get("category");
  const dishes = await getDishes();
  const result = category ? dishes.filter((d) => d.category === category) : dishes;
  return Response.json(result);
}
