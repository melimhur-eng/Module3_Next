import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, publicOrder } from "@/lib/orders";
import OrderProgress from "./OrderProgress";
import OrderStatusLine from "./OrderStatusLine";

export const metadata = { title: "Track your order · Addis Eats" };

// Rendered on the server with the current status, then kept up to date in the
// browser by polling GET /api/orders/[id] (see DATA.md).
export default async function OrderPage({ params }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const initial = publicOrder(order);

  return (
    <section className="card">
      <h2>Order {initial.id}</h2>
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
      <Link href="/orders">All recent orders</Link>
    </section>
  );
}
