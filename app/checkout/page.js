import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AREAS } from "@/lib/validate";
import { getUser } from "@/lib/session";
import { signOut } from "../login/actions";
import Checkout from "./Checkout";

export const metadata = { title: "Checkout · Addis Eats" };

export default async function CheckoutPage() {
  // The guard: no signed-in user, no checkout. It runs on the server before
  // anything is rendered, and comes back here after signing in.
  const user = await getUser();
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
