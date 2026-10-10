import Link from "next/link";
import { redirect } from "next/navigation";
import { listOrdersFor, publicOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { signOut } from "../login/actions";
import CancelButton from "./CancelButton";

export const metadata = {
  title: "Your orders",
  description: "Orders you have placed with Addis Eats, and cancelling one that is not yet being prepared.",
};

export default async function OrdersPage() {
  // verified while rendering, not only in middleware
  const user = await getSession();
  if (!user) redirect("/login?next=/orders");

  // scoped to the session's own id: there is no way to ask for anyone else's
  const orders = listOrdersFor(user.id).map(publicOrder);

  return (
    <section>
      <form action={signOut} className="signed-in">
        Signed in as <strong>{user.name}</strong> <button type="submit">Sign out</button>
        {user.role === "staff" && <Link href="/kitchen">Kitchen →</Link>}
      </form>
      <h1>Your orders</h1>
      {orders.length === 0 ? (
        <>
          <p className="empty">You have not placed any orders yet.</p>
          <Link href="/menu">Browse the menu</Link>
        </>
      ) : (
        <ul className="orders">
          {orders.map((o) => (
            <li key={o.id} className="card">
              <Link href={`/orders/${o.id}`}>
                <strong>{o.id}</strong>
              </Link>{" "}
              · {o.area} · {o.items.reduce((n, i) => n + i.qty, 0)} items · {o.total} ETB ·{" "}
              <span className={o.status === "cancelled" ? "muted" : undefined}>{o.status}</span>
              {o.status === "placed" && (
                <div>
                  <CancelButton orderId={o.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
