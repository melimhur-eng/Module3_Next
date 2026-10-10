import dishes from "@/public/dishes.json";
import { AREAS } from "./validate";

// Two weeks of made-up past orders so the dashboard and the order history have
// something to show. A fixed seed makes the numbers the same on every start.
// Almaz gets a long history (for paging); Dawit gets none (the empty state).
export function seedOrders() {
  let seed = 42;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const pick = (list) => list[Math.floor(random() * list.length)];

  const customers = [
    { userId: "usr_almaz", name: "Almaz", phone: "0911223344" },
    { userId: "usr_guest1", name: "Selam", phone: "0922334455" },
    { userId: "usr_guest2", name: "Yonas", phone: "0933445566" },
    { userId: "usr_guest3", name: "Hirut", phone: "+251944556677" },
  ];

  const orders = [];
  const now = Date.now();
  for (let i = 0; i < 90; i++) {
    const daysAgo = 14 - Math.floor((i / 90) * 14); // spread over the last 14 days
    const createdAt = new Date(now - daysAgo * 86400000 + Math.floor(random() * 36000000));
    const customer = i % 3 === 0 ? customers[0] : pick(customers.slice(1));
    const count = 1 + Math.floor(random() * 3);
    const items = [];
    for (let j = 0; j < count; j++) {
      const dish = pick(dishes);
      const existing = items.find((x) => x.id === dish.id);
      if (existing) existing.qty += 1;
      else items.push({ id: dish.id, name: dish.name, price: dish.price, qty: 1 });
    }
    orders.push({
      id: `AE-${1001 + i}`,
      ...customer,
      area: pick(AREAS),
      notes: "",
      items,
      total: items.reduce((sum, x) => sum + x.price * x.qty, 0),
      status: random() < 0.08 ? "cancelled" : "delivered",
      createdAt: createdAt.toISOString(),
    });
  }
  return orders;
}
