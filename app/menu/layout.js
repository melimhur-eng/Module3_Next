import { Suspense } from "react";
import Link from "next/link";
import CategoryBar, { CategoryButtons } from "./CategoryBar";
import ViewCounter from "./ViewCounter";

// Wraps /menu and every /menu/[id] page. Because a layout is not re-rendered
// when you move between its child pages, the sidebar (and its state) survives.
export default function MenuLayout({ children }) {
  return (
    <div className="menu-layout">
      <aside className="sidebar">
        <h2>Categories</h2>
        <Suspense fallback={<CategoryButtons selected={null} />}>
          <CategoryBar />
        </Suspense>
        <ViewCounter />
        <p>
          <Link href="/browse">Browse all dishes, page by page →</Link>
        </p>
      </aside>
      <div>{children}</div>
    </div>
  );
}
