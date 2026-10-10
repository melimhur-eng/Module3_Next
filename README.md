# Addis Eats (Next.js)

Addis Eats, a food-ordering app for Addis Ababa, rebuilt on **Next.js (App
Router)** for CodeOps Module 3, week 8. It has the same features as the Day 35
React version, plus file-based routing, nested layouts, a deliberate rendering
strategy per route, server components fetching their own data, and its own
endpoints and server actions.

- **[STRATEGY.md](STRATEGY.md)**: how every route is rendered, and why
- **[BOUNDARY.md](BOUNDARY.md)**: which components run on the server or the client, and why
- **[DATA.md](DATA.md)**: every client-side query, its key and refresh rule
- **[AUTH.md](AUTH.md)**: sign-in, the three layers of protection, and three attacks that failed

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

`SESSION_SECRET` signs the session cookie. `.env.local` is ignored by git,
and the value is only read on the server.

### Demo accounts

These are made-up accounts for trying the app. Only salted hashes of the
passwords are stored, in `lib/users.js`.

| Name | Phone | Password | Role |
|---|---|---|---|
| Almaz | 0911000001 | `almaz-pass` | customer |
| Dawit | 0911000002 | `dawit-pass` | customer |
| Hana | 0911000003 | `kitchen-pass` | staff (can open `/kitchen`) |

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
| `/checkout` | `app/checkout/page.js` | The validated checkout form. **Private**: signed-out visitors are sent to `/login` and back afterwards |
| `/login` | `app/login/page.js` | Sign in with phone number and password |
| `/kitchen` | `app/kitchen/page.js` | **Staff only**: every order, with a "Mark delivered" button |
| `/orders` | `app/orders/page.js` | **Private**: your own orders, with cancel |
| `/orders/[id]` | `app/orders/[id]/page.js` | **Private**: track one of your orders, server-rendered then polled every 5 s |
| `/browse?page=2` | `app/browse/page.js` | Every dish, 3 per page; the page number is in the URL |
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
| GET | `/api/dishes?q=tibs` | **200**: dishes whose name contains the term (used by the menu search) |
| GET | `/api/dishes?page=2&limit=3` | **200**: `{ items, page, totalPages, total }` (used by `/browse`) |
| GET | `/api/orders/[id]` | **200**: your order and its live status · **401**: not signed in · **404**: no such order *for you*. Polled by the tracking page |
| GET | `/api/dishes/[id]` | **200**: the dish · **404**: no dish with that id |
| POST | `/api/orders` | **201**: the created order · **400**: the body is not JSON · **401**: not signed in · **422**: validation failed, with `fieldErrors` per field |

`POST /api/orders` takes `{ name, phone, area, notes?, items: [{ id, qty }] }`.
It validates with the **same `lib/validate.js` rules as the checkout form**,
and the server looks up every price itself, so a request can't change what an
order costs.

```bash
curl -i -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{}'
# 401 {"error":{"message":"Sign in to place an order."}}
# With a valid session cookie, an invalid phone number gives
# 422 {"error":{"message":"Some details need fixing.","fieldErrors":{"phone":"Use 09XXXXXXXX or +2519XXXXXXXX."}}}
```

### Server actions

| Action | File | What it does |
|---|---|---|
| `placeOrder` | `app/checkout/actions.js` | The checkout form submits straight to it (no `fetch`). `useActionState` provides the pending flag that disables the button. It returns `fieldErrors` or the order, and calls `revalidatePath("/orders")` |
| `cancelOrder` | `app/orders/actions.js` | Checks **on the server** that there is a valid session and that it belongs to the person who placed the order. Hiding the button would not be enough, because an action can be called with any id |
| `signIn`, `signOut` | `app/login/actions.js` | Plain form actions (they work without JavaScript); `next` is validated by `safeNext` |
| `markDelivered` | `app/kitchen/actions.js` | Staff only: the role is checked inside the action |

**Security:** see [AUTH.md](AUTH.md). Middleware (`middleware.js`) redirects
signed-out visitors away from `/checkout`, `/orders` and `/kitchen`. Every
private page verifies the session again while rendering, and every write
checks the session and ownership (or the staff role) inside the action.

Orders are kept in memory (a stand-in for a database), so they disappear when
the server restarts.

## Live data in the browser (SWR)

Three things are fetched from the browser with SWR, all through one shared
fetcher. Details are in [DATA.md](DATA.md).

- **Order tracking** (`/orders/[id]`): the first paint comes from the server
  (`fallbackData`), then it polls every 5 s until the order is delivered.
- **Menu search**: debounced, with a `null` key when the box is empty and
  `keepPreviousData` so results never flash empty.
- **Paging** (`/browse?page=2`): the page number lives in the URL.

**What the Network tab shows while typing:** typing "tibs" in the menu search
sends **one** request, `GET /api/dishes?q=tibs`, about 300 ms after the last
key, instead of one per letter. Clearing the box sends nothing, and the
server-rendered list comes back. Typing the same term again within a couple
of seconds is served from SWR's cache.

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
├ ○ /_not-found                            141 B         103 kB
├ ƒ /api/dishes                            141 B         103 kB
├ ƒ /api/dishes/[id]                       141 B         103 kB
├ ƒ /api/orders                            141 B         103 kB
├ ƒ /api/orders/[id]                       141 B         103 kB
├ ○ /browse                                964 B         112 kB
├ ○ /cart                                  778 B         109 kB
├ ƒ /checkout                            2.35 kB         111 kB
├ ƒ /kitchen                               141 B         103 kB
├ ƒ /login                                 141 B         103 kB
├ ○ /menu                                2.28 kB         115 kB          1h      1y
├ ● /menu/[id]                             528 B         109 kB
├   ├ /menu/doro-wat
├   ├ /menu/shiro
├   ├ /menu/tibs
├   └ [+4 more paths]
├ ƒ /orders                                675 B         107 kB
└ ƒ /orders/[id]                           822 B         112 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-ce8c7c75002f810b.js       46.5 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.92 kB


ƒ Middleware                             34.2 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

## Day 40 verification (on the production build: `npm run build && npm start`)

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
    [id]/    page.js, OrderStatusLine, OrderProgress (SWR polling)
  browse/    page.js, PagedDishes (SWR paging)
  login/     page.js, actions.js (signIn, signOut)
  kitchen/   page.js, actions.js (markDelivered), staff only
middleware.js  redirects signed-out visitors from the private routes
  api/
    dishes/route.js, dishes/[id]/route.js, orders/route.js, orders/[id]/route.js
components/  Header, NavLinks, CartBadge, Providers, Card, Modal
lib/         dishes.js, orders.js (order store), validate.js (shared rules),
             session.js (getSession, server-only), users.js (hashed passwords),
             safeNext.js, http.js, cartStore.js,
             fetcher.js, useOrder.js, useDebounce.js
public/      dishes.json (the menu data)
```
