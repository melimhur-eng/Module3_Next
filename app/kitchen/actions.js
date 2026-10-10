"use server";

import { revalidatePath } from "next/cache";
import { currentStatus, getOrder, setOrderStatus } from "@/lib/orders";
import { getSession } from "@/lib/session";

// The role is checked here, where the change happens — not just by hiding the
// button from customers.
export async function markDelivered(formData) {
  const user = await getSession();
  if (!user || user.role !== "staff") {
    throw new Error("Not allowed: only kitchen staff can update orders.");
  }

  const order = getOrder(String(formData.get("orderId")));
  if (order && !["cancelled", "delivered"].includes(currentStatus(order))) {
    setOrderStatus(order.id, "delivered");
  }
  revalidatePath("/kitchen");
}
