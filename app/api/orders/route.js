import { revalidatePath } from "next/cache";
import { createOrder, publicOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/http";
import { getSession } from "@/lib/session";

// POST /api/orders
//   201 -> the created order
//   400 -> the body is not JSON
//   401 -> not signed in
//   422 -> validation failed, with fieldErrors named by field
export async function POST(request) {
  const user = await getSession();
  if (!user) return errorResponse(401, "Sign in to place an order.");

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "The request body must be JSON.");
  }

  // the owner is always the signed-in user, never an id from the body
  const { order, fieldErrors } = await createOrder(body, user.id);
  if (fieldErrors) return errorResponse(422, "Some details need fixing.", fieldErrors);

  revalidatePath("/orders");
  return Response.json(publicOrder(order), { status: 201 });
}
