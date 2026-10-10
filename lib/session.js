import "server-only"; // importing this file from a client component is a build error
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

// The session is a signed token held in one cookie: the claims
// { id, name, role, exp } plus an HMAC signature made with SESSION_SECRET.
// The browser can carry it but cannot change it without the signature failing.
const COOKIE = "session";
const LIFETIME_SECONDS = 60 * 60 * 24 * 7; // one week

function sign(data) {
  const secret = process.env.SESSION_SECRET; // server-only: no NEXT_PUBLIC_ prefix
  if (!secret) {
    throw new Error("SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in.");
  }
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function verify(token) {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = sign(data);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  const claims = JSON.parse(Buffer.from(data, "base64url").toString());
  if (claims.exp < Date.now() / 1000) return null; // expired
  return { id: claims.id, name: claims.name, role: claims.role };
}

// The one helper used by pages, server actions and route handlers alike.
// Returns { id, name, role } for a valid session, otherwise null.
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verify(token) : null;
}

// Only call from a server action or route handler: setting a cookie needs a response.
export async function createSession(user) {
  const claims = {
    id: user.id,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + LIFETIME_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(claims)).toString("base64url");

  (await cookies()).set(COOKIE, `${data}.${sign(data)}`, {
    httpOnly: true, // page scripts cannot read it
    secure: process.env.NODE_ENV === "production", // HTTPS only once deployed
    sameSite: "lax", // not sent on requests started by other sites
    path: "/",
    maxAge: LIFETIME_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
