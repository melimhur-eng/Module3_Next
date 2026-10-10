import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getOrderFor, publicOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import OrderProgress from "./OrderProgress";
import OrderStatusLine from "./OrderStatusLine";

export const metadata = {
  title: "Track your order",
  description: "Live status of your Addis Eats order, from the kitchen to your door.",
};

// Rendered on the server with the current status, then kept up to date in the
// browser by polling GET /api/orders/[id] (see DATA.md).
export default async function OrderPage({ params }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect(`/login?next=/orders/${encodeURIComponent(id)}`);

  // someone else's order id gives the same "not found" as a made-up one
  const order = getOrderFor(user.id, id);
  if (!order) notFound();

  const initial = publicOrder(order);

  return (
    <section className="card">
      <h1>Order {initial.id}</h1>
      <OrderStatusLine id={id} fallbackData={initial} />
      <OrderProgress id={id} fallbackData={initial} />
      <ul className="cart-lines">
        {initial.items.map((i) => (
          <li key={i.id}>
            {i.name} × {i.qty} — {i.price * i.qty} ETB
          </li>
        ))}
      </ul>
      <p className="total">
        {initial.total} ETB · to {initial.area}
      </p>
      <Link href="/orders">All your orders</Link>
    </section>
  );
}
