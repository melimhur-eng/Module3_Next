"use client"; // error boundaries catch errors in the browser too, so this must be a client component

import Link from "next/link";

export default function MenuError({ error, reset }) {
  return (
    <section className="card" role="alert">
      <h2>⚠ The menu is unavailable</h2>
      <p>Something went wrong showing the menu. Your cart is safe.</p>
      <button onClick={reset}>Try again</button> <Link href="/">Go to the home page</Link>
    </section>
  );
}
