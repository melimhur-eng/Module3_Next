import "server-only"; // importing this file from a client component is a build error
import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Signed cookies: the value is stored as "<data>.<signature>". The signature
// uses SESSION_SECRET, which only the server knows, so a cookie cannot be
// forged or edited in the browser without the server noticing.
const CUSTOMER_COOKIE = "addis-eats-customer"; // who placed an order
const USER_COOKIE = "addis-eats-user"; // who is signed in

const cookieOptions = {
  httpOnly: true, // not readable from browser JavaScript
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function sign(data) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in.");
  }
  return createHmac("sha256", secret).update(data).digest("hex");
}

function encode(value) {
  const data = Buffer.from(value).toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(raw) {
  const [data, signature] = raw?.split(".") ?? [];
  if (!data || !signature) return null;
  const expected = sign(data);
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return valid ? Buffer.from(data, "base64url").toString() : null;
}

// ---- customer id (owner of orders) ----

export async function getCustomerId() {
  return decode((await cookies()).get(CUSTOMER_COOKIE)?.value);
}

// Only call from a route handler or server action: setting a cookie needs a response.
export async function getOrCreateCustomerId() {
  const existing = await getCustomerId();
  if (existing) return existing;

  const id = randomUUID();
  (await cookies()).set(CUSTOMER_COOKIE, encode(id), {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

// ---- signed-in user ----

export async function getUser() {
  const name = decode((await cookies()).get(USER_COOKIE)?.value);
  return name ? { name } : null;
}

export async function setUser(name) {
  (await cookies()).set(USER_COOKIE, encode(name), { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearUser() {
  (await cookies()).delete(USER_COOKIE);
}
