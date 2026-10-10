# AUTH.md: who can see and change what

## How sign-in works

1. The person posts their phone number and password to the `signIn` server
   action (`app/login/actions.js`).
2. `checkCredentials` (`lib/users.js`) compares the password with a stored
   **salted scrypt hash**. Passwords themselves are never stored.
3. `createSession` (`lib/session.js`) sets one cookie, `session`, holding the
   claims `{ id, name, role, exp }` plus an HMAC signature made with
   `SESSION_SECRET`.
4. The browser sends the cookie with every request. `getSession()` checks the
   signature and expiry and returns `{ id, name, role }`, or `null`. **The
   same helper is used by every page, action and route handler.**
5. Signing out deletes the cookie.

The cookie flags:

| Flag | What it blocks |
|---|---|
| `httpOnly` | Scripts on the page reading the session (`document.cookie` does not show it) |
| `secure` (in production) | Reading it off an open network: it is only sent over HTTPS |
| `sameSite: "lax"` | Another site making requests as the signed-in person |
| `maxAge` 7 days, plus `exp` inside the signed claims | A stolen token working forever |

`SESSION_SECRET` lives in `.env.local` (git-ignored) and has no `NEXT_PUBLIC_`
prefix. A production build was searched for it, for the password hashes and
for the hashing code: none of them are in the browser's JavaScript.

## The three layers

| Layer | Where | What it proves | Is it security? |
|---|---|---|---|
| 1. Middleware | `middleware.js`, matcher `/checkout/:path*`, `/orders/:path*`, `/kitchen/:path*` | Only that **a cookie named `session` exists**. It redirects to `/login?next=…` before any page is built | No: it's a cheap shortcut. A junk cookie gets past it |
| 2. Page | `getSession()` at the top of each private page | The cookie is **genuine and not expired**, and the screen matches the person (their orders, their name, the staff view) | Partly |
| 3. Action / handler | `getSession()` + an ownership or role check inside every write | **This person may do this to this record** | **Yes**: this is the check that cannot be skipped |

## Protected routes

| Route | Layer 1 | Layer 2 | Layer 3 |
|---|---|---|---|
| `/checkout` | Redirect if no cookie | `getSession()`, else redirect to `/login?next=/checkout` | `placeOrder` checks the session again; the order's owner is always `user.id`, never a value from the form |
| `/orders` | Redirect if no cookie | `getSession()`; the list is `listOrdersFor(user.id)`, so it can only ever contain your orders | `cancelOrder` checks the session (401-style message) **and** that `order.userId === user.id` (403-style message) |
| `/orders/[id]` | Redirect if no cookie | `getOrderFor(user.id, id)`: someone else's order id shows "Not found", exactly like a made-up id | `GET /api/orders/[id]` (polled by the page): 401 without a session, 404 for an order that isn't yours |
| `/kitchen` | Redirect if no cookie | `getSession()` and `role === "staff"`, otherwise "Staff only" | `markDelivered` throws unless the session's role is `staff` |
| `POST /api/orders` | Not in the matcher (it's an API) | — | 401 without a valid session; the owner is the session's id |

## Every action and handler that writes

| Action / handler | Authentication | Authorisation |
|---|---|---|
| `signIn` | Checks the phone and password against the stored hash | `next` must pass `safeNext()` |
| `signOut` | — (deletes the cookie) | — |
| `placeOrder` | `getSession()`, else "Your sign-in has expired" | The owner is always `session.id`; prices come from the server's menu |
| `POST /api/orders` | `getSession()`, else 401 | The owner is always `session.id` |
| `cancelOrder` | `getSession()`, else refused | `order.userId === session.id`, else refused |
| `markDelivered` | `getSession()`, else throws | `session.role === "staff"`, else throws |

The "Kitchen →" link only appears for staff, but that is just the interface.
The page and the action refuse non-staff whether or not the link is shown.

## Returning after sign-in, safely

Middleware puts the original path in `?next=`. After signing in, `signIn`
redirects there, but only through `safeNext()` (`lib/safeNext.js`), which
accepts a value only if it starts with `/` and not with `//` or `/\`
(browsers treat both as another site). Anything else goes to `/`.

## The three attacks, and what stopped them

| Attack | What happened | The line that stopped it |
|---|---|---|
| **Call a server action while signed out.** `cancelOrder("AE-5608")` sent straight to the server with the `Next-Action` header. | Without a cookie, middleware redirected the request to `/login`. With a junk `session` cookie (which gets past middleware), the action answered `"Please sign in to cancel an order."`, and `POST /api/orders` answered **401** | `app/orders/actions.js`: `if (!user) return { error: "Please sign in…" }` after `getSession()` returned `null` (the signature check in `lib/session.js` rejected the junk token) |
| **Sign in as Dawit and touch Almaz's order AE-5608.** Called `cancelOrder` from the browser console, fetched `/api/orders/AE-5608`, and opened `/orders/AE-5608` | `"You can only cancel your own orders."`, then **404**, then "Not found". Almaz's order was untouched, and Dawit's own list was empty | `app/orders/actions.js`: `if (!order \|\| order.userId !== user.id)`; `lib/orders.js`: `getOrderFor(userId, id)` matches on both the id and the owner |
| **Craft a sign-in link with `next` pointing at another site.** `/login?next=https://evil.example/steal`, then also edited the hidden field to `//evil.example/steal` before submitting | The page rendered `next` as `/`. After the tampered submit, the browser landed on `http://localhost:3000/`, not on evil.example | `lib/safeNext.js`: `if (!next.startsWith("/") \|\| next.startsWith("//") \|\| next.startsWith("/\\")) return "/"`, called in both `app/login/page.js` and the `signIn` action |

Also tried: a customer opening `/kitchen` gets "Staff only", and calling
`markDelivered` without a staff session throws
`"Not allowed: only kitchen staff can update orders."`
(`app/kitchen/actions.js`, line 12).
