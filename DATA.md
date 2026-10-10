# DATA.md: every client-side query

Most data in Addis Eats is read on the server (the menu, the dish pages, the
orders list). SWR is used only where the **browser** has to keep asking: for
an order's status, for search-as-you-type, and for paging. Every query uses
the shared `fetcher` in `lib/fetcher.js`, which throws for non-OK responses,
so a 404 or 500 becomes SWR's `error` and never ends up in `data`.

| Query | Key | Refresh rule | Why |
|---|---|---|---|
| Order status (`useOrder`, used by `OrderStatusLine` and `OrderProgress`) | `/api/orders/${id}` | `refreshInterval` 5 s, stopping (0) once the status is `delivered` or `cancelled`. `fallbackData` comes from the server render | An order changes on its own every minute or so; 5 s feels live without hammering the server, and polling a finished order is wasted. |
| Menu search (`FilterShell`) | `/api/dishes?q=${term}`, or **`null`** when the box is empty | Debounced 300 ms (`useDebounce`), `keepPreviousData: true`, SWR's default 2 s de-duplication | The term only matters once typing pauses. An empty box needs no request, because the server-rendered list is already on screen. Keeping the last results visible stops the list flashing empty between searches. |
| Paged dishes (`PagedDishes`) | `/api/dishes?page=${page}&limit=3` | `keepPreviousData: true`; the page number comes from the URL (`?page=2`) | Each page is its own key, so going back to a page is instant from the cache. Keeping the previous page on screen (dimmed) while the next one loads avoids a blank flash, and the page lives in the URL so it can be linked and shared. |

## What was verified

- **One request for two components.** `OrderStatusLine` and `OrderProgress`
  both call `useOrder(id)`. The Network tab shows one
  `GET /api/orders/AE-…` every 5 s (measured at 0.9 s, 5.9 s, 11.0 s and
  16.0 s), not two.
- **No spinner on first paint.** `/orders/[id]` renders the order on the
  server and passes it as `fallbackData`, so the status is there in the HTML.
  Polling then takes over, and the status moved from "placed" to "preparing"
  on its own.
- **Hidden tabs don't poll.** SWR pauses `refreshInterval` while the tab is
  hidden and catches up when it becomes visible again.
- **Typing "tibs" sends one request**, `GET /api/dishes?q=tibs`, about 300 ms
  after the last key, not four. Clearing the box sends none.
- **No flash between pages.** Clicking page 3 keeps page 2's dishes on screen
  (dimmed) until page 3 arrives.
