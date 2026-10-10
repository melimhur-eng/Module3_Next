"use client"; // error boundaries catch errors in the browser too, so this must be a client component

export default function DashboardError({ reset }) {
  return (
    <section className="card" role="alert">
      <h1>⚠ The dashboard could not load</h1>
      <p>The order figures could not be read just now. Nothing has been lost.</p>
      <button onClick={reset}>Try again</button>
    </section>
  );
}
