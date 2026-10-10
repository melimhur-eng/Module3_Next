"use client";

import { useOrder } from "@/lib/useOrder";

// Uses the same key as OrderProgress, so both share a single request.
export default function OrderStatusLine({ id, fallbackData }) {
  const { data: order, error, isValidating } = useOrder(id, fallbackData);

  return (
    <p className="muted" aria-live="polite">
      Status: <strong>{order.status}</strong>
      {isValidating && " · checking…"}
      {error && " · could not refresh, will try again"}
    </p>
  );
}
