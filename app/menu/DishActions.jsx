"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import { useCartStore } from "@/lib/cartStore";

// The only interactive part of a dish card: the Add button and the quick view.
export default function DishActions({ dish }) {
  const { id, name, price, category, spicy } = dish;
  const addItem = useCartStore((s) => s.addItem);
  const [showDetails, setShowDetails] = useState(false);

  // /menu?crash=tibs makes that dish throw while rendering, to show app/menu/error.js
  if (useSearchParams().get("crash") === id) {
    throw new Error(`Simulated crash while rendering ${name}`);
  }

  return (
    <>
      <button onClick={() => addItem(dish)}>Add</button>{" "}
      <button onClick={() => setShowDetails(true)}>Quick view</button>
      {showDetails && (
        <Modal title={name} onClose={() => setShowDetails(false)}>
          <p>Category: {category}</p>
          <p>{spicy ? "This dish is spicy 🌶" : "Mild — not spicy."}</p>
          <p className="total">{price} ETB</p>
          <button
            onClick={() => {
              addItem(dish);
              setShowDetails(false);
            }}
          >
            Add to order
          </button>{" "}
          <Link href={`/menu/${id}`}>Open the full page</Link>
        </Modal>
      )}
    </>
  );
}
