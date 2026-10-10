"use client";

import { useState, useTransition } from "react";
import { cancelOrder } from "./actions";

export default function CancelButton({ orderId }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(null);

  function handleClick() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      setMessage(result.error ?? null);
    });
  }

  return (
    <>
      <button onClick={handleClick} disabled={isPending}>
        {isPending ? "Cancelling…" : "Cancel"}
      </button>
      {message && (
        <span className="error" role="alert">
          {" "}
          ⚠ {message}
        </span>
      )}
    </>
  );
}
