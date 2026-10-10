"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cartStore";

// Client-only setup for the whole app, kept in its own file so layout.js can
// stay a server component. It loads the saved cart from localStorage once the
// page is running in the browser (the server has no localStorage).
export default function Providers({ children }) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return children;
}
