import "server-only";
import { AREAS } from "./validate";
import { listAllOrders } from "./orders";

// Aggregation happens here, on the server: the dashboard receives a handful of
// summary rows, never the orders themselves.
function completedOrders() {
  return listAllOrders().filter((o) => o.status !== "cancelled");
}

export function revenueByArea() {
  const orders = completedOrders();
  return AREAS.map((area) => ({
    area,
    revenue: orders.filter((o) => o.area === area).reduce((sum, o) => sum + o.total, 0),
    orders: orders.filter((o) => o.area === area).length,
  }));
}

// Orders per day for the last `days` days, oldest first, including empty days.
export function ordersPerDay(days = 14) {
  const orders = completedOrders();
  const rows = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const onDay = orders.filter((o) => o.createdAt.slice(0, 10) === day);
    rows.push({
      day,
      label: new Date(day).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      orders: onDay.length,
      revenue: onDay.reduce((sum, o) => sum + o.total, 0),
    });
  }
  return rows;
}
