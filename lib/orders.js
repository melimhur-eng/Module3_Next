import { getDishes } from "./dishes";
import { validate } from "./validate";

// In-memory order store standing in for a database. It is kept on globalThis
// so it survives hot reloads in development; it is emptied when the server restarts.
const store = (globalThis.__addisEatsOrders ??= []);

export function listOrders() {
  return [...store].reverse();
}

export function getOrder(id) {
  return store.find((o) => o.id === id) ?? null;
}

// Validates the details and the items, then saves the order.
// Prices come from the menu on the server, never from the request.
// Returns { order } or { fieldErrors }.
export async function createOrder(input, customerId) {
  const details = {
    name: input?.name,
    phone: input?.phone,
    area: input?.area,
    notes: input?.notes ?? "",
  };
  const fieldErrors = validate(details);

  const menu = await getDishes();
  const requested = Array.isArray(input?.items) ? input.items : [];
  const items = requested
    .map((i) => {
      const dish = menu.find((d) => d.id === i?.id);
      const qty = Number(i?.qty);
      if (!dish || !Number.isInteger(qty) || qty < 1 || qty > 20) return null;
      return { id: dish.id, name: dish.name, price: dish.price, qty };
    })
    .filter(Boolean);

  if (items.length === 0 || items.length !== requested.length) {
    fieldErrors.items = "Your order has no valid dishes in it.";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const order = {
    id: "AE-" + Math.floor(1000 + Math.random() * 9000),
    customerId,
    name: details.name.trim(),
    phone: details.phone.replace(/\s/g, ""),
    area: details.area,
    notes: details.notes.trim(),
    items,
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: "placed",
    createdAt: new Date().toISOString(),
  };
  store.push(order);
  return { order };
}

export function setOrderStatus(id, status) {
  const order = getOrder(id);
  if (order) order.status = status;
  return order;
}
