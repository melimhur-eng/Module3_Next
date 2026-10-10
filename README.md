# Addis Eats (Next.js)

Addis Eats, a food-ordering app for Addis Ababa, rebuilt on **Next.js (App
Router)** for CodeOps Module 3, week 8. It has the same features as the Day 35
React version, plus file-based routing, nested layouts, a deliberate rendering
strategy per route, server components fetching their own data, and its own
endpoints and server actions.

- **[STRATEGY.md](STRATEGY.md)**: how every route is rendered, and why
- **[BOUNDARY.md](BOUNDARY.md)**: which components run on the server or the client, and why

The components from the React version move across almost unchanged. What
changes is the routing: every screen is now a folder inside `app/`, and the
loading, error and not-found states are files with reserved names.

## How to run

You need Node.js 18.18 or newer.

```bash
npm install
cp .env.example .env.local   # then put a long random string in SESSION_SECRET
npm run dev
```

`SESSION_SECRET` signs the customer cookie that proves who placed an order.
`.env.local` is ignored by git, and the value is only read on the server.

Then open http://localhost:3000. For a production build:

```bash
npm run build
npm start
```

## Routes and the files that produce them

| URL | File | What it shows |
|---|---|---|
| `/` | `app/page.js` | Today's specials and a link into the menu |
| `/menu` | `app/menu/page.js` | The menu with search and category chips |
| `/menu?category=Vegan` | `app/menu/page.js` | The same page, filtered by the query string |
| `/menu/[id]` (e.g. `/menu/kitfo`) | `app/menu/[id]/page.js` | One dish. `id` comes from the `params` prop, and an unknown id calls `notFound()` |
| `/cart` | `app/cart/page.js` | Order lines and the running ETB total |
| `/checkout` | `app/checkout/page.js` | The validated checkout form. **Guarded**: signed-out visitors are sent to `/login` and back afterwards |
| `/login` | `app/login/page.js` | Pretend sign-in (just a name), stored in a signed, httpOnly cookie |
| `/orders` | `app/orders/page.js` | Recent orders (cached, refreshed after each order or cancellation) |
| any unknown URL | `app/not-found.js` | "Not found" with links back |

How each route is rendered (static, revalidated, prebuilt or dynamic) and why
is explained in [STRATEGY.md](STRATEGY.md).

Special files:

| File | When it appears |
|---|---|
| `app/layout.js` | Wraps every page: owns `<html>` and `<body>`, the header and the footer |
| `app/menu/layout.js` | Wraps `/menu` and every dish page: the category sidebar, which survives navigation |
| `app/menu/loading.js` | While anything in `/menu` is rendering on the server, e.g. opening a dish |
| `app/menu/error.js` | When something in `/menu` throws. Try `/menu?crash=tibs` |
| `app/not-found.js` | For unknown URLs, and when a page calls `notFound()` (e.g. `/menu/not-a-dish`) |

**Not every file in `app/` is a route.** `app/menu/DishList.jsx`,
`DishCard.jsx`, `CategoryBar.jsx` and `FilterShell.jsx` sit next to the menu page, but
only files named `page.js` become URLs, so `/menu/DishList` shows "Not found".

All internal navigation uses `next/link`. `CategoryBar` (in the menu sidebar)
is a client component that changes the category with `useRouter().push()`.

## API

Every error response has the same shape:
`{ "error": { "message": "...", "fieldErrors": { ... } } }`
(`fieldErrors` only appears for validation errors).

| Method | Endpoint | Status codes |
|---|---|---|
| GET | `/api/dishes` | **200**: every dish |
| GET | `/api/dishes?category=Vegan` | **200**: only that category (an empty array if none) |
| GET | `/api/dishes/[id]` | **200**: the dish · **404**: no dish with that id |
| POST | `/api/orders` | **201**: the created order · **400**: the body is not JSON · **422**: validation failed, with `fieldErrors` per field |

`POST /api/orders` takes `{ name, phone, area, notes?, items: [{ id, qty }] }`.
It validates with the **same `lib/validate.js` rules as the checkout form**,
and the server looks up every price itself, so a request can't change what an
order costs.

```bash
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
  -d '{"name":"Almaz","phone":"12345","area":"Bole","items":[{"id":"shiro","qty":1}]}'
# 422 {"error":{"message":"Some details need fixing.","fieldErrors":{"phone":"Use 09XXXXXXXX or +2519XXXXXXXX."}}}
```

### Server actions

| Action | File | What it does |
|---|---|---|
| `placeOrder` | `app/checkout/actions.js` | The checkout form submits straight to it (no `fetch`). `useActionState` provides the pending flag that disables the button. It returns `fieldErrors` or the order, and calls `revalidatePath("/orders")` |
| `cancelOrder` | `app/orders/actions.js` | Checks **on the server** that there is a session cookie and that it belongs to the person who placed the order. Hiding the button would not be enough, because an action can be called with any id |

Orders are kept in memory (a stand-in for a database), so they disappear when
the server restarts.

## Server and client components

Which components run on the server and which in the browser, and why, is in
[BOUNDARY.md](BOUNDARY.md). The menu page is now an async server component
that awaits its dishes. Only the interactive pieces (Add, Quick view, search,
category buttons) are client components.

First Load JS for `/menu`, from `npm run build`:

| | Page JS | First Load JS |
|---|---|---|
| Before (client `Menu` fetching with `useFetch`) | 2.06 kB | 111 kB |
| After (server page, client leaves only) | 1.75 kB | 110 kB |

## Build output

`npm run build`. Every marker matches STRATEGY.md:

```
Route (app)                                 Size  First Load JS  Revalidate  Expire
┌ ○ /                                      165 B         106 kB          1h      1y
├ ○ /_not-found                            138 B         103 kB
├ ƒ /api/dishes                            138 B         103 kB
├ ƒ /api/dishes/[id]                       138 B         103 kB
├ ƒ /api/orders                            138 B         103 kB
├ ○ /cart                                  778 B         109 kB
├ ƒ /checkout                            2.34 kB         111 kB
├ ƒ /login                                 138 B         103 kB
├ ○ /menu                                1.75 kB         110 kB          1h      1y
├ ● /menu/[id]                             528 B         109 kB
├   ├ /menu/doro-wat
├   ├ /menu/shiro
├   ├ /menu/tibs
├   └ [+4 more paths]
└ ○ /orders                                670 B         107 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-ce8c7c75002f810b.js       46.5 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.92 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

## Verification (on the production build: `npm run build && npm start`)

| Check | Result |
|---|---|
| `curl -i /api/dishes/not-a-dish` | `404` and `{ "error": { "message": … } }` |
| `curl -i -X POST /api/orders -d '{"name":"Almaz","phone":"0912"}'` | `422` with `fieldErrors.phone` (plus `area` and `items`) |
| Open `/checkout` signed out | `307` redirect to `/login?next=/checkout`, then back after signing in |
| A forged `addis-eats-user` cookie | Rejected (signature check), redirected to `/login` |
| Cancel someone else's order | Refused inside `cancelOrder`: "You can only cancel your own orders." |
| Slow connection | `menu/loading.js` skeleton inside the shell; the header and sidebar are already there |
| Throw inside the menu (`/menu?crash=tibs`) | `menu/error.js`; the header, sidebar and cart survive |
| `/menu/not-a-dish` | `404` with `not-found.js` |
| Invalid phone number | The message appears beside the field (browser), and `422` from the server |
| Search the browser JavaScript for the secret | Not found (neither the value nor the name) |
| JavaScript disabled | Sign-in and sign-out are plain `<form action>` server actions and work. The checkout form also posts to a server action, but the cart lives in the browser's `localStorage`, so without JavaScript there are no dishes to order |

### Bundle: Day 35 (React + Vite) vs Day 40 (Next.js)

| | JavaScript for the menu screen (gzipped) | How the dishes arrive |
|---|---|---|
| Day 35 Vite build | 60.2 kB (one bundle for the whole app) | A second request to `dishes.json` after the JavaScript runs |
| Day 40 Next.js `/menu` | 110 kB First Load JS (103 kB of it is React + Next.js, shared by every page) | Already in the HTML of the first response |

The Next.js runtime is bigger than a bare Vite app. What the server components
change is what the browser has to do: the dish list is plain HTML, and the
menu page's own JavaScript is 1.75 kB, holding only the buttons and the
search box.

## Project structure

```
app/
  layout.js, globals.css, page.js, not-found.js
  menu/      layout.js, page.js, loading.js, error.js,
             FilterShell, DishList, DishCard, DishActions, CategoryBar, ViewCounter
    [id]/    page.js, AddToOrder
  cart/      page.js, Cart
  checkout/  page.js, Checkout, Field, actions.js (placeOrder)
  orders/    page.js, CancelButton, actions.js (cancelOrder)
  login/     page.js, actions.js (signIn, signOut)
  api/
    dishes/route.js, dishes/[id]/route.js, orders/route.js
components/  Header, NavLinks, CartBadge, Providers, Card, Modal
lib/         dishes.js, orders.js (order store), validate.js (shared rules),
             session.js (signed cookie, server-only), http.js, cartStore.js
public/      dishes.json (the menu data)
```
