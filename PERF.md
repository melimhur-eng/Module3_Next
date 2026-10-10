# PERF.md: making Addis Eats fast, measured

## The performance budget (Day 45)

Median of 3 Lighthouse runs (mobile, throttled) on the production build.
"Before" is the app as it stood at the start of Day 43, once the photos, font
and widget had been added. "After" is the end of Day 45.

| Measure | Target | Before | After | Met? |
|---|---|---|---|---|
| LCP, throttled: `/` | under 2.5 s | 3.08 s | 2.11 s | ✓ |
| LCP, throttled: `/menu` | under 2.5 s | 35.39 s | 2.17 s | ✓ |
| CLS (worst page) | under 0.1 | 0.085 (Day 43, step 3) | 0.000 | ✓ |
| First Load JS, `/menu` | under 120 kB | 121 kB (Day 44) | 117 kB | ✓ |
| Largest image | under 150 kB | 1,527 KiB (the hero JPEG) | 12 KiB | ✓ |
| Lighthouse performance | 90 or better | 86 (`/`) · 67 (`/menu`) | 99 · 99 | ✓ |
| TBT | — | up to 611 ms (Day 43) | 40 ms · 50 ms | |

### Day 45 changes, and what caused each

| Change | Effect |
|---|---|
| The search results (and SWR with them) moved into `SearchResults.jsx`, loaded with `next/dynamic` the first time someone types | `/menu` First Load JS 121 kB → 117 kB. Nothing about searching changed: the chunk arrives with the first keystroke, before the debounced request |
| `priority` on the menu's **first** dish photo (still exactly one priority image per page; the home page's is the hero) | The trace showed the menu's LCP element was that thumbnail, waiting 1.3 s because it was lazy-loaded. Menu LCP 2.67 s → 2.17 s, and the last bit of layout shift disappeared, because the image now arrives with the first paint |
| Help chat as a **facade**: a plain "Need help?" button, with the widget script (`next/script`) rendered only after a tap | The widget's 600 ms start-up task no longer runs on every page view. TBT about 560 ms → about 45 ms, and the score went from 85 to 99. Someone who wants help waits a moment once; everyone else pays nothing |

Results at the end of Day 45:

| Page | LCP | CLS | TBT | Weight | Largest image | Score |
|---|---|---|---|---|---|---|
| `/` | 2.11 s | 0 | 40 ms | 208 KiB | 12 KiB | 99 |
| `/menu` | 2.17 s | 0 | 50 ms | 231 KiB | 5 KiB | 99 |

These were measured with `next start` on this machine. Deployment comes on
Day 48, where the same checks get repeated against the live URL.

---

# Day 43: the first optimisation pass

## How it was measured

- **Production build only:** `npm run build && npm start`, never `npm run dev`.
- **Lighthouse 12.8.2**, mobile preset with simulated throttling (a mid-range
  phone on a slow 4G connection), performance category only.
- **Median of 3 runs** for each page, after each change. Each change is its
  own commit, so every row can be rebuilt and measured again.
- Lighthouse can't measure INP (that needs a real person tapping), so
  **TBT** (Total Blocking Time) is the lab stand-in for how quickly the page
  responds.

Targets: LCP under 2.5 s, CLS under 0.1, TBT as low as possible.

## Before anything changed

The app had dish photos and a hero image added the simple way: plain `<img>`
tags pointing at camera-sized JPEGs (2400 × 1600, about 1.3 MB each), the
Poppins font from a Google Fonts `<link>`, and a help-chat widget (a stand-in
for a third-party support script) in a `<script>` tag.

## Results

| Step | `/` LCP | `/` CLS | `/` TBT | `/` weight | `/menu` LCP | `/menu` CLS | `/menu` TBT | `/menu` weight |
|---|---|---|---|---|---|---|---|---|
| 0. Before | 3.08 s | 0 | 0 ms | 1,709 KiB | **35.39 s** | 0 | 32 ms | **9,265 KiB** |
| 1. `<img>` → `next/image` with `width`, `height`, `sizes` | 2.84 s | 0 | 0 ms | 201 KiB | 3.25 s | 0 | 235 ms | 218 KiB |
| 2. `priority` on the home hero | 3.05 s | 0 | 0 ms | 201 KiB | 3.24 s | 0 | 133 ms | 217 KiB |
| 3. Google Fonts `<link>` → `next/font` | **2.10 s** | 0 | 611 ms | 209 KiB | 3.20 s | 0.085 | 631 ms | 226 KiB |
| 4. Widget → `next/script` `lazyOnload` | 2.12 s | 0 | 560 ms | 211 KiB | 2.75 s | 0.085 | 456 ms | 228 KiB |
| 5. `main { min-height: 100vh }` | 2.13 s | 0 | 574 ms | 211 KiB | **2.67 s** | **0.038** | 452 ms | 228 KiB |

**Overall:** home LCP 3.08 s → 2.13 s, menu LCP 35.4 s → 2.67 s, and the menu
download from 9.3 MB to 0.23 MB.

## What caused each change

1. **`next/image` did most of the work.** The menu was downloading seven
   1.3 MB originals to show 160-pixel thumbnails. With `sizes="160px"`, Next.js
   serves a small, resized WebP of each instead (the page went from 9.3 MB to
   218 KiB), and the images below the fold load lazily. `width` and `height`
   reserve each image's space before it arrives. Menu LCP fell from 35 s to
   3.3 s: **the single biggest change**.
2. **`priority` changed nothing measurable**, and the trace says why. The
   hero's own load time was already 0 ms. Its LCP was 2.6 s of *render delay*,
   because the browser couldn't paint anything until the Google Fonts
   stylesheet arrived from another host. `priority` stays on the hero because
   it is still the largest thing above the fold, and it's the only image with
   it.
3. **`next/font` fixed the home page's LCP** (3.05 s → 2.10 s). The font is
   now downloaded at build time and served from this site: there's no
   render-blocking stylesheet and no connection to Google, so the page paints
   as soon as its own HTML and CSS arrive. Two numbers got *worse* in this
   step, and both were already there, just hidden:
   - **TBT went from about 0 to about 600 ms.** The chat widget's start-up is
     one 600 ms long task. Before, it ran while the font was still blocking
     the first paint, and TBT only counts what happens after the first paint.
     Now that the page paints earlier, the long task is visible.
   - **Menu CLS went from 0 to 0.085.** The page now paints before the dish
     list has streamed in, and when the list arrives it pushes the footer
     down the screen.
4. **`next/script` with `strategy="lazyOnload"`** moved the widget out of the
   page's critical path. It now starts after the page has loaded (about
   2.3–2.7 s, after the menu's LCP), so menu LCP improved to 2.75 s. It can't
   make the widget's own 600 ms of work any shorter, and that task still lands
   inside Lighthouse's TBT window, so TBT stays around 450–570 ms. A real
   widget's cost belongs to its vendor. The next step would be to load it only
   when someone taps "Need help?".
5. **Reserving space fixed most of the jump.** Giving `<main>` at least a
   screen of height means the streamed dish list grows into space that's
   already there, so the footer no longer moves while it's on screen. Menu CLS
   is 0.038, under 0.1. What's left is the list replacing its loading
   skeleton inside the menu column.

**The single change that did most for LCP:** `next/image`, for the menu.
For the home page it was `next/font`, removing the render-blocking third-party
stylesheet.

## Images and environment checklist

- Every image goes through `next/image` with `width`, `height`, `sizes` and
  alt text that describes it ("A plate of Kitfo"). There are no plain `<img>`
  tags left.
- `priority` is on exactly one image: the home page hero.
- All images are served from this site (`public/images`), so no remote hosts
  need listing in `next.config.mjs` (`images.remotePatterns` would be where
  they go).
- `next/font` replaced the Google Fonts `<link>`.
- The only third-party-style script uses `next/script`: `lazyOnload` on Day 43,
  then (Day 45) rendered only after someone taps "Need help?".
- `.env.example` is committed and lists every variable. `.env*` is ignored by
  git except `.env.example`. The only secret, `SESSION_SECRET`, has no
  `NEXT_PUBLIC_` prefix, and a production bundle was searched to confirm it is
  not there.
