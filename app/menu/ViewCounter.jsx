"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Lives in the menu layout. The count keeps going up as you open dishes,
// which proves the layout is not remounted when the page inside it changes.
export default function ViewCounter() {
  const pathname = usePathname();
  const [viewed, setViewed] = useState(0);

  useEffect(() => {
    if (pathname.startsWith("/menu/")) setViewed((v) => v + 1);
  }, [pathname]);

  return <p className="muted">Dishes viewed this visit: {viewed}</p>;
}
