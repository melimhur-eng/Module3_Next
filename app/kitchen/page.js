import { redirect } from "next/navigation";
import { currentStatus, listAllOrders } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { markDelivered } from "./actions";

export const metadata = {
  title: "Kitchen",
  description: "Staff view of every Addis Eats order.",
};

// Staff only. Middleware made sure a cookie exists; this checks the role.
export default async function KitchenPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/kitchen");

  if (user.role !== "staff") {
    return (
      <section>
        <h1>Staff only</h1>
        <p>This page is for the Addis Eats kitchen team.</p>
      </section>
    );
  }

  const orders = listAllOrders();

  return (
    <section>
      <h1>Kitchen — all orders</h1>
      {orders.length === 0 && <p className="empty">No orders yet.</p>}
      <ul className="orders">
        {orders.map((o) => {
          const status = currentStatus(o);
          return (
            <li key={o.id} className="card">
              <strong>{o.id}</strong> · {status} · {o.name}, {o.phone} · {o.area}
              <br />
              {o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")} · {o.total} ETB
              {o.notes && <p className="muted">Note: {o.notes}</p>}
              {!["cancelled", "delivered"].includes(status) && (
                // a plain form posting to a server action: works without JavaScript
                <form action={markDelivered}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <button type="submit">Mark delivered</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
