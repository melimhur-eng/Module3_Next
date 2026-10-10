import { getOrder, publicOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/http";

// GET /api/orders/AE-1234 -> 200 with the order's public details, or 404.
// Exists for the tracking page, which polls it every few seconds.
export async function GET(request, { params }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) return errorResponse(404, `No order with id "${id}".`);
  return Response.json(publicOrder(order));
}
