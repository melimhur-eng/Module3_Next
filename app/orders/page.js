import Link from "next/link";
import { listOrders, publicOrder } from "@/lib/orders";
import CancelButton from "./CancelButton";

export const metadata = { title: "Recent orders · Addis Eats" };

// A cached (static) page. It is rebuilt only when an order is placed or
// cancelled, because those actions call revalidatePath("/orders"). The status
// shown is the one at that moment; each order's own page tracks it live.
export default function OrdersPage() {
  const orders = listOrders().map(publicOrder);

  if (orders.length === 0) {
    return (
      <section>
        <h2>Recent orders</h2>
        <p className="empty">No orders yet.</p>
        <Link href="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <section>
      <h2>Recent orders</h2>
      <ul className="orders">
        {orders.map((o) => (
          <li key={o.id} className="card">
            <Link href={`/orders/${o.id}`}>
              <strong>{o.id}</strong>
            </Link>{" "}
            · {o.area} ·{" "}
            {o.items.reduce((n, i) => n + i.qty, 0)} items · {o.total} ETB ·{" "}
            <span className={o.status === "cancelled" ? "muted" : undefined}>{o.status}</span>
            {o.status === "placed" && (
              <div>
                <CancelButton orderId={o.id} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
