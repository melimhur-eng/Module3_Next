import dishes from "@/public/dishes.json";

// Stands in for a database. The short delay makes loading states visible.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDishes() {
  await wait(300);
  return dishes;
}

export async function getDish(id) {
  await wait(300);
  return dishes.find((d) => d.id === id) ?? null;
}
