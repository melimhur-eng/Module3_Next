import Link from "next/link";

// Used for unknown URLs and whenever a page calls notFound()
export default function NotFound() {
  return (
    <section>
      <h1>Not found</h1>
      <p>We could not find that page or dish.</p>
      <Link href="/menu">Browse the menu</Link> · <Link href="/">Home</Link>
    </section>
  );
}
