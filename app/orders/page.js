import Link from "next/link";
import { redirect } from "next/navigation";
import { etb } from "@/lib/format";
import { pageOfOrdersFor, publicOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { signOut } from "../login/actions";
import CancelButton from "./CancelButton";

export const metadata = {
  title: "Your orders",
  description: "Orders you have placed with Addis Eats, and cancelling one that is not yet being prepared.",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sorting and paging live in the URL (/orders?sort=total&dir=asc&page=2), so a
// view can be shared and survives a refresh, and the table stays on the server.
function href({ sort, dir, page }) {
  return `/orders?sort=${sort}&dir=${dir}&page=${page}`;
}

const CAPTIONS = {
  "date-desc": "by date, newest first",
  "date-asc": "by date, oldest first",
  "total-desc": "by total, largest first",
  "total-asc": "by total, smallest first",
};

function SortHeader({ label, column, sort, dir, className }) {
  const active = sort === column;
  // clicking the active column flips the direction; a new column starts descending
  const nextDir = active && dir === "desc" ? "asc" : "desc";
  return (
    <th
      scope="col"
      className={className}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <Link href={href({ sort: column, dir: nextDir, page: 1 })}>
        {label} {active ? (dir === "asc" ? "▲" : "▼") : ""}
      </Link>
    </th>
  );
}

export default async function OrdersPage({ searchParams }) {
  // verified while rendering, not only in middleware
  const user = await getSession();
  if (!user) redirect("/login?next=/orders");

  const params = await searchParams;
  // demo switches, so each state can be shown on demand
  if (params.slow) await wait(2000); // loading.js
  if (params.fail) throw new Error("Simulated failure while loading orders"); // error.js

  const sort = params.sort === "total" ? "total" : "date";
  const dir = params.dir === "asc" ? "asc" : "desc";
  // scoped to the session's own id; only one page of rows comes back
  const { rows, total, page, pages } = pageOfOrdersFor(user.id, {
    sort,
    dir,
    page: Number(params.page) || 1,
    perPage: 10,
  });
  const orders = rows.map(publicOrder);

  return (
    <section>
      <form action={signOut} className="signed-in">
        Signed in as <strong>{user.name}</strong> <button type="submit">Sign out</button>
        {user.role === "staff" && <Link href="/kitchen">Kitchen →</Link>}
      </form>
      <h1>Your orders</h1>

      {total === 0 ? (
        <p className="empty">
          You have not placed any orders yet. <Link href="/menu">Browse the menu</Link> to place
          your first.
        </p>
      ) : (
        <>
          <div className="table-wrap" role="region" aria-label="Your orders" tabIndex={0}>
            <table>
              <caption>Your orders, {CAPTIONS[`${sort}-${dir}`]}</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <SortHeader label="Date" column="date" sort={sort} dir={dir} />
                  <th scope="col">Area</th>
                  <SortHeader label="Total" column="total" sort={sort} dir={dir} className="num" />
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <th scope="row">
                      <Link href={`/orders/${o.id}`}>{o.id}</Link>
                    </th>
                    <td>
                      {new Date(o.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{o.area}</td>
                    <td className="num">{etb(o.total)}</td>
                    <td>
                      {o.status}
                      {o.status === "placed" && (
                        <>
                          {" "}
                          <CancelButton orderId={o.id} />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="pager" aria-label="Pages of orders">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={href({ sort, dir, page: n })}
                aria-current={n === page ? "page" : undefined}
                className={n === page ? "active" : undefined}
              >
                {n}
              </Link>
            ))}
          </nav>
          <p className="muted">
            Page {page} of {pages} · {total} orders
          </p>
        </>
      )}
    </section>
  );
}
