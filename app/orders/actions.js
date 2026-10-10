"use server";

import { revalidatePath } from "next/cache";
import { currentStatus, getOrder, setOrderStatus } from "@/lib/orders";
import { getCustomerId } from "@/lib/session";

// A server action is a public endpoint: anyone can call it with any id, even
// if the button is hidden. So the checks happen here, on the server, every time.
export async function cancelOrder(orderId) {
  const customerId = await getCustomerId();
  if (!customerId) {
    return { error: "We don't know who you are — only the person who placed an order can cancel it." };
  }

  const order = getOrder(orderId);
  if (!order) return { error: "That order does not exist." };
  if (order.customerId !== customerId) return { error: "You can only cancel your own orders." };
  if (currentStatus(order) !== "placed") {
    return { error: "This order is already being prepared and can no longer be cancelled." };
  }

  setOrderStatus(orderId, "cancelled");
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}
