import { safeNext } from "@/lib/safeNext";
import { signIn } from "./actions";

export const metadata = { title: "Sign in · Addis Eats" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  return (
    <form action={signIn} className="order-form">
      <h1>Sign in</h1>
      {params.error && (
        <p className="error" role="alert">
          ⚠ That phone number and password do not match an account.
        </p>
      )}
      <input type="hidden" name="next" value={next} />

      <label htmlFor="login-phone">Phone number</label>
      <input id="login-phone" name="phone" type="tel" autoComplete="tel" required />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <button type="submit">Sign in</button>
    </form>
  );
}
