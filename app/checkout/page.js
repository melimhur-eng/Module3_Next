import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AREAS } from "@/lib/validate";
import { getSession } from "@/lib/session";
import { signOut } from "../login/actions";
import Checkout from "./Checkout";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery area and TeleBirr number to place your Addis Eats order.",
};

export default async function CheckoutPage() {
  // Layer 2: middleware only saw that a cookie exists; this verifies it.
  const user = await getSession();
  if (!user) redirect("/login?next=/checkout");

  // These cookies() reads make the route dynamic: the page depends on who is
  // asking, so it is rendered on every request instead of at build time.
  const saved = (await cookies()).get("addis-eats-area")?.value;
  const defaultArea = AREAS.includes(saved) ? saved : "Bole";

  return (
    <>
      <form action={signOut} className="signed-in">
        Signed in as <strong>{user.name}</strong> <button type="submit">Sign out</button>
      </form>
      <Checkout defaultArea={defaultArea} defaultName={user.name} />
    </>
  );
}
