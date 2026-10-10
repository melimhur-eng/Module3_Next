"use client"; // error boundaries catch errors in the browser too, so this must be a client component

import Link from "next/link";

export default function OrdersError({ reset }) {
  return (
    <section className="card" role="alert">
      <h1>⚠ Your orders could not load</h1>
      <p>Your orders are safe; we just could not read them right now.</p>
      <button onClick={reset}>Try again</button> <Link href="/menu">Back to the menu</Link>
    </section>
  );
}
