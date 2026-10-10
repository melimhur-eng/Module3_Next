"use server";

import { revalidatePath } from "next/cache";
import { currentStatus, getOrder, setOrderStatus } from "@/lib/orders";
import { getSession } from "@/lib/session";

// Layer 3, the real check. A server action is a public endpoint: anyone can
// call it with any id, signed in or not, button or no button.
export async function cancelOrder(orderId) {
  // authentication: who is asking?
  const user = await getSession();
  if (!user) return { error: "Please sign in to cancel an order." };

  // authorisation: may this person touch this order?
  const order = getOrder(orderId);
  if (!order || order.userId !== user.id) return { error: "You can only cancel your own orders." };

  if (currentStatus(order) !== "placed") {
    return { error: "This order is already being prepared and can no longer be cancelled." };
  }

  setOrderStatus(orderId, "cancelled");
  revalidatePath("/orders");
  return { ok: true };
}
