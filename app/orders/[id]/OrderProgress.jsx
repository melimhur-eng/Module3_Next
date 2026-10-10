"use client";

import { useOrder } from "@/lib/useOrder";

const STEPS = ["placed", "preparing", "on the way", "delivered"];

export default function OrderProgress({ id, fallbackData }) {
  const { data: order } = useOrder(id, fallbackData);

  if (order.status === "cancelled") {
    return <p className="error">This order was cancelled.</p>;
  }

  const reached = STEPS.indexOf(order.status);
  return (
    <ol className="progress">
      {STEPS.map((step, i) => (
        <li key={step} className={i <= reached ? "done" : undefined}>
          {i <= reached ? "✓ " : ""}
          {step}
        </li>
      ))}
    </ol>
  );
}
