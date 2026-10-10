import { cookies } from "next/headers";
import Checkout from "./Checkout";
import { AREAS } from "@/lib/validate";

export const metadata = { title: "Checkout · Addis Eats" };

export default async function CheckoutPage() {
  // This cookies() read makes the route dynamic: the page depends on who is
  // asking, so it is rendered on every request instead of at build time.
  const saved = (await cookies()).get("addis-eats-area")?.value;
  const defaultArea = AREAS.includes(saved) ? saved : "Bole";

  return <Checkout defaultArea={defaultArea} />;
}
