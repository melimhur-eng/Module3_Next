# BOUNDARY.md: which side each component runs on

In the App Router everything is a **server component** unless its file starts
with `"use client"`. Server components send HTML and no JavaScript. Client
components are sent to the browser so they can use state, effects, event
handlers or browser-only APIs.

There are 16 files with `"use client"` (not counting the two client hooks in `lib/`), each on the smallest component that
needs it.

## Server components

| Component | Why it can stay on the server |
|---|---|
| `app/layout.js` | Static shell: `<html>`, `<body>`, header and footer. Its only client piece (`Providers`) receives the page as `children` |
| `app/page.js` (home) | Awaits `getDishes()` and renders a list of links |
| `app/menu/layout.js` | Only arranges the sidebar and the page |
| `app/menu/page.js` | Awaits `getDishes()` directly; no hooks |
| `app/menu/DishList.jsx` | Maps the dishes to cards; no interaction |
| `app/menu/DishCard.jsx` | Plain markup: name, link, badge, price |
| `app/menu/loading.js` | Static skeleton |
| `app/menu/[id]/page.js` | Awaits `getDish()`, calls `notFound()` |
| `app/cart/page.js` | Thin page around the client `Cart` |
| `app/checkout/page.js` | The guard: reads the signed sign-in cookie and redirects; the sign-out form posts to a server action |
| `app/login/page.js` | A plain `<form action={signIn}>`, which works without JavaScript |
| `app/orders/page.js` | Reads the order store and renders the list |
| `app/orders/[id]/page.js` | Reads the order and passes it to the polling components as `fallbackData` |
| `app/browse/page.js` | A static heading and a Suspense boundary |
| `app/not-found.js` | Static message |
| `components/Header.jsx` | Title and layout; its interactive parts are client children |
| `components/Card.jsx` | A styled wrapper around `children` |

## Client components

| Component | Why it needs the browser |
|---|---|
| `components/Providers.jsx` | Rehydrates the cart from `localStorage` in an effect |
| `components/NavLinks.jsx` | `usePathname()` to highlight the current page |
| `components/CartBadge.jsx` | Subscribes to the cart store |
| `components/Modal.jsx` | `createPortal`, key listeners, focus management |
| `app/menu/FilterShell.jsx` | Search state, debounced SWR search, `useRef` focus, `useSearchParams()`; shares the category with `FilterItem` through context |
| `app/menu/DishActions.jsx` | Add button (store) and the quick-view modal (state) |
| `app/menu/CategoryBar.jsx` | `useRouter().push()` and `useSearchParams()` |
| `app/menu/ViewCounter.jsx` | State and an effect on `usePathname()` |
| `app/menu/error.js` | Error boundaries catch errors thrown in the browser, so they must be client components; it also uses `reset` from an `onClick` |
| `app/menu/[id]/AddToOrder.jsx` | Adds to the cart store on click |
| `app/cart/Cart.jsx` | Reads the store; remove / clear buttons |
| `app/checkout/Checkout.jsx` | The controlled form: state, touched, `useActionState` |
| `app/orders/[id]/OrderStatusLine.jsx`, `OrderProgress.jsx` | Poll the order with SWR (`useOrder`) |
| `app/browse/PagedDishes.jsx` | SWR paging and `useSearchParams()` |
| `app/orders/CancelButton.jsx` | `useTransition` pending state and the error message from `cancelOrder` |

`lib/cartStore.js` is a plain module with no directive. It's only imported by
client components.

## Server-only code

`"use server"` files (`app/checkout/actions.js`, `app/orders/actions.js`,
`app/login/actions.js`) run only on the server. The browser gets a reference it
can call, never the code. `lib/session.js` imports `server-only`, so importing
it from a client component would fail the build, and `SESSION_SECRET` can't
leak into the bundle. A production build was searched for the secret's value
and for `SESSION_SECRET`, and neither appears.

## Rules followed

- **Server content goes into client components through `children`.**
  `FilterShell` (client) wraps `<DishList>` (server). `Providers` (client)
  wraps the whole page. The server-rendered cards are never re-sent as
  JavaScript.
- **No callback props cross from server to client.** Server components only
  pass plain data (`dish`, `index`, `defaultArea`) to client components.
  Every handler is defined inside the client component that uses it.
- **`layout.js` imports nothing with the directive except `Providers` and
  `Header`'s client children.** Both are leaves.

## Proof: what the browser downloads

The production build's browser chunks were searched for each component's
code. `DishActions` ("Quick view") is in the menu page chunk. `DishCard`'s
markup (the `badge` class) and the dish data ("Doro Wat", `getDishes`) appear
in no browser chunk. The list is HTML only.

| `/menu` | Page JS | First Load JS |
|---|---|---|
| Before (Day 37: client `Menu` + `useFetch`) | 2.06 kB | 111 kB |
| After (server page + client leaves) | 1.75 kB | 110 kB |

The page's own JavaScript shrank by 15%. The remaining ~103 kB is React and
Next.js itself, shared by every page. The bigger win doesn't show in the
table: the dishes now arrive as HTML in the first response, instead of after
a second request to `/dishes.json` once the JavaScript has loaded.
