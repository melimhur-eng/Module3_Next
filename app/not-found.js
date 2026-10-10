import Link from "next/link";

// Used for unknown URLs and whenever a page calls notFound()
export default function NotFound() {
  return (
    <section>
      <h2>Not found</h2>
      <p>We could not find that page or dish.</p>
      <Link href="/menu">Browse the menu</Link> · <Link href="/">Home</Link>
    </section>
  );
}
