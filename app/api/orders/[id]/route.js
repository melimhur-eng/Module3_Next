import { getOrderFor, publicOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/http";
import { getSession } from "@/lib/session";

// GET /api/orders/AE-1234
//   200 -> your order with its live status (polled by the tracking page)
//   401 -> not signed in
//   404 -> no such order *for you* (someone else's order looks the same as a missing one)
export async function GET(request, { params }) {
  const user = await getSession();
  if (!user) return errorResponse(401, "Sign in to see your orders.");

  const { id } = await params;
  const order = getOrderFor(user.id, id);
  if (!order) return errorResponse(404, `No order with id "${id}".`);
  return Response.json(publicOrder(order));
}
