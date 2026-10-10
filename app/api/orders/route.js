import { revalidatePath } from "next/cache";
import { createOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/http";
import { getOrCreateCustomerId } from "@/lib/session";

// POST /api/orders
//   201 -> the created order
//   400 -> the body is not JSON
//   422 -> validation failed, with fieldErrors named by field
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "The request body must be JSON.");
  }

  const customerId = await getOrCreateCustomerId();
  const { order, fieldErrors } = await createOrder(body, customerId);
  if (fieldErrors) return errorResponse(422, "Some details need fixing.", fieldErrors);

  revalidatePath("/orders");
  const { customerId: _, ...publicOrder } = order; // never echo the internal id
  return Response.json(publicOrder, { status: 201 });
}
