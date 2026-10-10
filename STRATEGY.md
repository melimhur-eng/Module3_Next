# STRATEGY.md: how each route is rendered

| Route | Strategy | Build marker | Why |
|---|---|---|---|
| `/` | Static, revalidate every hour | ○ 1h | Today's specials change at most daily; an hourly refresh keeps them current without rendering per visitor. |
| `/menu` | Static, revalidate every hour (`export const revalidate = 3600`) | ○ 1h | The menu changes a few times a day at most, and is the same for everyone. |
| `/menu/[id]` | Static, one page per dish (`generateStaticParams`, `dynamicParams = false`) | ● | Every dish is known at build time, so each page is plain HTML, and any other id is a real 404. |
| `/cart` | Static shell | ○ | The cart lives in the visitor's browser (localStorage), so the server sends the same empty shell to everyone. |
| `/checkout` | Dynamic | ƒ | It checks the sign-in cookie (`getUser()`, redirecting to `/login` if missing) and reads `addis-eats-area` to pre-fill the form, so it depends on who is asking. |
| `/login` | Dynamic | ƒ | It reads `searchParams` (`next`, `error`) to know where to send you back. |
| `/orders` | Static, revalidated on demand | ○ | The list only changes when an order is placed or cancelled, so those actions call `revalidatePath("/orders")` instead of rendering on every visit. |
| `/api/*` | Dynamic | ƒ | Route handlers read the request (query string, body, cookies). |
| not found | Static | ○ | The same message for everyone. |

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
