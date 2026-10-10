import { getDish } from "@/lib/dishes";
import { errorResponse } from "@/lib/http";

// GET /api/dishes/kitfo -> 200 with the dish, or 404 if there is no such dish
export async function GET(request, { params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) return errorResponse(404, `No dish with id "${id}".`);
  return Response.json(dish);
}
