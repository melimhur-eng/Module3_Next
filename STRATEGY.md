# STRATEGY.md: how each route is rendered

| Route | Strategy | Build marker | Why |
|---|---|---|---|
| `/` | Static, revalidate every hour | ○ 1h | Today's specials change at most daily; an hourly refresh keeps them current without rendering per visitor. |
| `/menu` | Static, revalidate every hour (`export const revalidate = 3600`) | ○ 1h | The menu changes a few times a day at most, and is the same for everyone. |
| `/menu/[id]` | Static, one page per dish (`generateStaticParams`, `dynamicParams = false`) | ● | Every dish is known at build time, so each page is plain HTML, and any other id is a real 404. |
| `/cart` | Static shell | ○ | The cart lives in the visitor's browser (localStorage), so the server sends the same empty shell to everyone. |
| `/checkout` | Dynamic | ƒ | It verifies the session (`getSession()`) and reads `addis-eats-area` to pre-fill the form, so it depends on who is asking. |
| `/login` | Dynamic | ƒ | It reads `searchParams` (`next`, `error`) to know where to send you back. |
| `/orders` | Dynamic | ƒ | Since Day 42 it shows only the signed-in person's orders, so it reads the session cookie and cannot be shared between visitors. (On Day 39 it was a public static list refreshed with `revalidatePath`.) |
| `/kitchen` | Dynamic | ƒ | Staff only: it reads the session to check the role, and shows live order data. |
| `/orders/[id]` | Dynamic, then polled in the browser | ƒ | It checks the session and that the order is yours, then renders the current status; SWR keeps it fresh afterwards (DATA.md). |
| `/browse` | Static shell, data fetched in the browser | ○ | The shell is the same for everyone; the page of dishes depends on `?page=`, which SWR fetches client-side. |
| `/api/*` | Dynamic | ƒ | Route handlers read the request (query string, body, cookies). |
| not found | Static | ○ | The same message for everyone. |
| `/sitemap.xml`, `/robots.txt` | Static | ○ | Generated from the menu at build time; they change only when the menu does. |
| `/opengraph-image.jpg` | Static file | ○ | One site-wide preview image. |
| `/menu/[id]/opengraph-image` | Static, one per dish | ● | Drawn at build time from each dish, with the same params as the dish pages. |

## Layouts

- `app/layout.js`, the root layout, owns `<html>` and `<body>`, imports
  `globals.css`, and renders the header, the navigation and the footer on
  every page.
- `app/menu/layout.js` wraps `/menu` and every `/menu/[id]`. Its category
  sidebar and "Dishes viewed this visit" counter keep their state when you
  open a dish, because a layout is not re-mounted when the page inside it
  changes.

## Streaming

The menu page wraps the dish list in `<Suspense>`. The sidebar in the menu
layout renders immediately, and the dish list shows a skeleton until its data
arrives.

## Middleware

`middleware.js` runs only on `/checkout`, `/orders` and `/kitchen` (its
matcher). It doesn't touch static pages, images or scripts, so the static and
prebuilt routes above stay as fast as before.
