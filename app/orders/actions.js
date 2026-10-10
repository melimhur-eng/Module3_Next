"use server";

import { revalidatePath } from "next/cache";
import { getOrder, setOrderStatus } from "@/lib/orders";
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
  if (order.status !== "placed") return { error: "This order is already cancelled." };

  setOrderStatus(orderId, "cancelled");
  revalidatePath("/orders");
  return { ok: true };
}
