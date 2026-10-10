import { getDishes } from "./dishes";
import { validate } from "./validate";
import { seedOrders } from "./seedOrders";

// In-memory order store standing in for a database. It is kept on globalThis
// so it survives hot reloads in development; it is emptied when the server restarts.
const store = (globalThis.__addisEatsOrders ??= seedOrders());

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

// For staff (the kitchen and the dashboard): every order, newest first.
export function listAllOrders() {
  return [...store].sort(newestFirst);
}

// For customers: only ever look orders up by the signed-in user's own id, so
// an id taken from the request can never return someone else's order.
//
// One page of a customer's orders, sorted on the server. Only that page (and a
// count) leaves this function — never the whole history.
const SORTS = {
  date: (a, b) => a.createdAt.localeCompare(b.createdAt),
  total: (a, b) => a.total - b.total,
};

export function pageOfOrdersFor(userId, { sort = "date", dir = "desc", page = 1, perPage = 10 }) {
  const compare = SORTS[sort] ?? SORTS.date;
  const sorted = store
    .filter((o) => o.userId === userId)
    .sort((a, b) => (dir === "asc" ? compare(a, b) : compare(b, a)));

  const pages = Math.max(Math.ceil(sorted.length / perPage), 1);
  const current = Math.min(Math.max(page, 1), pages);
  return {
    rows: sorted.slice((current - 1) * perPage, current * perPage),
    total: sorted.length,
    page: current,
    pages,
  };
}

export function getOrderFor(userId, id) {
  return store.find((o) => o.id === id && o.userId === userId) ?? null;
}

export function getOrder(id) {
  return store.find((o) => o.id === id) ?? null;
}

// Pretend kitchen: an order moves along by itself as time passes,
// so the tracking page has something to poll for.
const STAGES = [
  { after: 0, status: "placed" },
  { after: 20, status: "preparing" },
  { after: 60, status: "on the way" },
  { after: 120, status: "delivered" },
];

export function currentStatus(order) {
  if (order.status === "cancelled" || order.status === "delivered") return order.status;
  const seconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;
  return STAGES.filter((s) => seconds >= s.after).at(-1).status;
}

// What a customer's browser receives: no owner id.
export function publicOrder(order) {
  return {
    id: order.id,
    area: order.area,
    phone: order.phone,
    items: order.items,
    total: order.total,
    createdAt: order.createdAt,
    status: currentStatus(order),
  };
}

// Validates the details and the items, then saves the order.
// Prices come from the menu on the server, never from the request.
// Returns { order } or { fieldErrors }.
export async function createOrder(input, userId) {
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

  let id;
  do {
    id = "AE-" + Math.floor(2000 + Math.random() * 8000);
  } while (getOrder(id));

  const order = {
    id,
    userId,
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
