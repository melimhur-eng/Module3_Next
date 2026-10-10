"use client";

import { selectCount, selectTotal, useCartStore } from "@/lib/cartStore";

export default function CartBadge() {
  const count = useCartStore(selectCount);
  const total = useCartStore(selectTotal);

  return (
    <span className="cart-badge" aria-label={`${count} items in cart`}>
      🛒 {count} · {total} ETB
    </span>
  );
}
