import "server-only"; // importing this file from a client component is a build error
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Identifies the customer who placed an order, so only they can cancel it.
// The cookie holds "<id>.<signature>". The signature uses SESSION_SECRET, which
// only the server knows, so nobody can forge someone else's id.
const COOKIE = "addis-eats-customer";

function sign(id) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in.");
  }
  return createHmac("sha256", secret).update(id).digest("hex");
}

export async function getCustomerId() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const [id, signature] = raw.split(".");
  const expected = sign(id ?? "");
  const valid =
    signature?.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return valid ? id : null;
}

// Only call from a route handler or server action: setting a cookie needs a response.
export async function getOrCreateCustomerId() {
  const existing = await getCustomerId();
  if (existing) return existing;

  const id = randomUUID();
  (await cookies()).set(COOKIE, `${id}.${sign(id)}`, {
    httpOnly: true, // not readable from browser JavaScript
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
