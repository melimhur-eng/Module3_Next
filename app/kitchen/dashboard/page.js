import Link from "next/link";
import { redirect } from "next/navigation";
import { etb } from "@/lib/format";
import { getSession } from "@/lib/session";
import { ordersPerDay, revenueByArea } from "@/lib/stats";
import OrdersChart from "./OrdersChart";
import RevenueChart from "./RevenueChart";

export const metadata = {
  title: "Dashboard",
  description: "Addis Eats revenue by neighbourhood and orders per day, for staff.",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A server component: it aggregates the orders here and sends only the summary
// rows (4 areas, 14 days) to the two chart leaves.
export default async function DashboardPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/login?next=/kitchen/dashboard");
  if (user.role !== "staff") {
    return (
      <section>
        <h1>Staff only</h1>
        <p>The dashboard is for the Addis Eats team.</p>
      </section>
    );
  }

  // demo switches, so each state can be shown on demand
  const params = await searchParams;
  if (params.slow) await wait(2000); // loading.js
  if (params.fail) throw new Error("Simulated failure while loading the dashboard"); // error.js

  const byArea = params.empty ? [] : revenueByArea();
  const perDay = params.empty ? [] : ordersPerDay(14);
  const totalOrders = perDay.reduce((sum, d) => sum + d.orders, 0);

  if (totalOrders === 0) {
    return (
      <section>
        <h1>Dashboard</h1>
        <p className="empty">
          No orders in the last 14 days yet, so there is nothing to chart. Once customers order,
          revenue and daily orders will appear here.
        </p>
        <Link href="/kitchen">Back to the kitchen</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="muted">
        Delivered orders only (cancelled orders are left out). <Link href="/kitchen">Kitchen →</Link>
      </p>

      <h2>Revenue by neighbourhood, last 14 days (ETB)</h2>
      <RevenueChart data={byArea} />
      <div className="table-wrap" role="region" aria-label="Revenue by neighbourhood" tabIndex={0}>
        <table>
          <caption>Revenue by neighbourhood, last 14 days</caption>
          <thead>
            <tr>
              <th scope="col">Neighbourhood</th>
              <th scope="col" className="num">Orders</th>
              <th scope="col" className="num">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {byArea.map((row) => (
              <tr key={row.area}>
                <th scope="row">{row.area}</th>
                <td className="num">{row.orders}</td>
                <td className="num">{etb(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Orders per day, last 14 days (number of orders)</h2>
      <OrdersChart data={perDay} />
      <div className="table-wrap" role="region" aria-label="Orders per day" tabIndex={0}>
        <table>
          <caption>Orders per day, last 14 days</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col" className="num">Orders</th>
              <th scope="col" className="num">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {perDay.map((row) => (
              <tr key={row.day}>
                <th scope="row">{row.label}</th>
                <td className="num">{row.orders}</td>
                <td className="num">{etb(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
