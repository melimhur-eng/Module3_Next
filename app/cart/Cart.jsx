"use client";

import Link from "next/link";
import { selectItems, selectTotal, useCartStore } from "@/lib/cartStore";

export default function Cart() {
  const items = useCartStore(selectItems);
  const total = useCartStore(selectTotal);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  if (items.length === 0) {
    return (
      <section>
        <h2>Your order</h2>
        <p className="empty">Your cart is empty.</p>
        <Link href="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Your order</h2>
      <ul className="cart-lines">
        {items.map((i) => (
          <li key={i.id}>
            {i.name} × {i.qty} — {i.price * i.qty} ETB{" "}
            <button onClick={() => remove(i.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p className="total">Total: {total} ETB</p>
      <button onClick={clear}>Clear cart</button>{" "}
      <Link className="cta" href="/checkout">
        Go to checkout →
      </Link>
    </section>
  );
}
