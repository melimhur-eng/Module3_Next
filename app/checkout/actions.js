"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createOrder, publicOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";

// Server action: runs on the server, called straight from the checkout form.
// Returns { order } on success or { fieldErrors } when something needs fixing.
export async function placeOrder(previousState, formData) {
  // check again here: the action can be called without going through the page
  const user = await getSession();
  if (!user) {
    return { formError: "Your sign-in has expired. Please sign in again to order." };
  }

  let items;
  try {
    items = JSON.parse(formData.get("items") ?? "[]");
  } catch {
    items = [];
  }

  const input = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    area: formData.get("area"),
    notes: formData.get("notes") ?? "",
    items,
  };

  // the owner is the signed-in user, never something sent from the form
  const { order, fieldErrors } = await createOrder(input, user.id);
  if (fieldErrors) return { fieldErrors };

  // remember the area so the next checkout starts with it
  (await cookies()).set("addis-eats-area", order.area, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  // the cached /orders page is now out of date
  revalidatePath("/orders");

  return { order: publicOrder(order) };
}
