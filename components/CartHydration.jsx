"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";

// Loads the saved cart from localStorage once the page is running in the browser.
export default function CartHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
