"use client";

import { useCartStore } from "@/lib/cartStore";

export default function AddToOrder({ dish }) {
  const addItem = useCartStore((s) => s.addItem);
  return <button onClick={() => addItem(dish)}>Add to order</button>;
}
