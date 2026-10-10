"use client";

import useSWR from "swr";
import { fetcher } from "./fetcher";

const FINISHED = ["delivered", "cancelled"];

// Every component tracking an order uses this hook. Because they share the
// same key, SWR sends one request for all of them, not one each.
export function useOrder(id, fallbackData) {
  return useSWR(`/api/orders/${id}`, fetcher, {
    // the server-rendered order: no spinner on the first paint
    fallbackData,
    // ask again every 5 seconds until the order is finished, then stop
    refreshInterval: (latest) => (latest && FINISHED.includes(latest.status) ? 0 : 5000),
  });
}
