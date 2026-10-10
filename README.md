# Addis Eats (Next.js)

Addis Eats, a food-ordering frontend for Addis Ababa, rebuilt on **Next.js
(App Router)** for CodeOps Module 3, week 8.

The components from the React version move across almost unchanged. What
changes is the routing: every screen is now a folder inside `app/`, and the
loading, error and not-found states are files with reserved names.

## How to run

You need Node.js 18.18 or newer.

```bash
npm install
npm run dev
```

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
| `/checkout` | `app/checkout/page.js` | The validated checkout form |
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
`CategoryBar.jsx`, `Dish.jsx` and `Menu.jsx` sit next to the menu page, but
only files named `page.js` become URLs, so `/menu/DishList` shows "Not found".

All internal navigation uses `next/link`. `CategoryBar` (in the menu sidebar)
is a client component that changes the category with `useRouter().push()`.

## Build output

`npm run build`:

```
Route (app)                                 Size  First Load JS  Revalidate  Expire
┌ ○ /                                      165 B         106 kB          1h      1y
├ ○ /_not-found                            127 B         103 kB
├ ○ /cart                                  778 B         109 kB
├ ƒ /checkout                            2.15 kB         111 kB
├ ○ /menu                                2.06 kB         111 kB          1h      1y
└ ● /menu/[id]                             528 B         109 kB
    ├ /menu/doro-wat
    ├ /menu/shiro
    ├ /menu/tibs
    └ [+4 more paths]
+ First Load JS shared by all             103 kB
  ├ chunks/255-ce8c7c75002f810b.js       46.5 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.92 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```


## Project structure

```
app/
  layout.js, globals.css, page.js, not-found.js
  menu/      layout.js, page.js, loading.js, error.js,
             Menu, CategoryBar, ViewCounter, DishList, Dish
    [id]/    page.js, AddToOrder
  cart/      page.js, Cart
  checkout/  page.js, Checkout, Field, validate.js
components/  Header, NavLinks, CartBadge, CartHydration, Card, Modal
lib/         dishes.js (getDishes / getDish), cartStore.js, useFetch.js, orders.js
public/      dishes.json (the menu data)
```
