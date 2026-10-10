import { signIn } from "./actions";

export const metadata = { title: "Sign in · Addis Eats" };

export default async function LoginPage({ searchParams }) {
  const { next = "/", error } = await searchParams;

  return (
    <form action={signIn} className="order-form">
      <h2>Sign in</h2>
      <p className="muted">Sign in to place your order.</p>
      {error === "name" && (
        <p className="error" role="alert">
          ⚠ Enter your name (at least 2 letters).
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <label htmlFor="login-name">Your name</label>
      <input id="login-name" name="name" autoComplete="name" required minLength={2} />
      <button type="submit">Sign in</button>
    </form>
  );
}
