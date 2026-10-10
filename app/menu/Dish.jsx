"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";

export default function Dish({ dish, onAdd }) {
  const { id, name, price, category, spicy } = dish;
  const [showDetails, setShowDetails] = useState(false);

  // /menu?crash=tibs makes that dish throw while rendering, to show app/menu/error.js
  if (useSearchParams().get("crash") === id) {
    throw new Error(`Simulated crash while rendering ${name}`);
  }

  return (
    <div className="dish">
      <h3>
        <Link href={`/menu/${id}`}>{name}</Link>{" "}
        {spicy === true && <span className="badge">Spicy</span>}
      </h3>
      <p>{price} ETB</p>
      <button onClick={() => onAdd(dish)}>Add</button>{" "}
      <button onClick={() => setShowDetails(true)}>Quick view</button>

      {showDetails && (
        <Modal title={name} onClose={() => setShowDetails(false)}>
          <p>Category: {category}</p>
          <p>{spicy ? "This dish is spicy 🌶" : "Mild — not spicy."}</p>
          <p className="total">{price} ETB</p>
          <button
            onClick={() => {
              onAdd(dish);
              setShowDetails(false);
            }}
          >
            Add to order
          </button>{" "}
          <Link href={`/menu/${id}`}>Open the full page</Link>
        </Modal>
      )}
    </div>
  );
}
