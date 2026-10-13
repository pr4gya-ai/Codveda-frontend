# Codveda Front-End Development Internship — Submission

Six tasks, two per level, each level in its own folder (the brief asks for a separate file per level).

| Level | Task | Folder | Run |
|---|---|---|---|
| 1 Basic | Responsive Landing Page | `level-1/task1-landing-page` | open `index.html` |
| 1 Basic | Interactive Form | `level-1/task2-interactive-form` | open `index.html` |
| 2 Intermediate | Single Page Application (React Router + Context) | `level-2-react-spa` | `npm i && npm run dev` |
| 2 Intermediate | REST API Integration (GitHub search, debounced) | `level-2-react-spa` (the **Explore** page) | same app |
| 3 Advanced | Performance Optimization (Lighthouse) | `level-3-performance` | `npm i && npm run build` |
| 3 Advanced | Advanced Animations (GSAP) | `level-3-animations` | `npm i && npm run dev` |

The Django task (Level 3, Task 1) was not chosen because it's a back-end task; the brief says to pick any two per level.

## Level 1
- **Landing page** — semantic HTML (`header/nav/main/section/article/footer`), CSS Grid + Flexbox, mobile-first with `640px` / `960px` breakpoints, smooth scrolling, IntersectionObserver reveal animations, count-up stats, accessible hamburger menu, `prefers-reduced-motion` support.
- **Form** — name / email / phone / password / confirm; validation on blur and live on input (after first touch), password-strength meter, show/hide password, focus + blur styling, `aria-live` errors, success confirmation without page reload.

## Level 2 — `level-2-react-spa` ("DevFinder")
- Routes: Home, Explore, User profile (`/user/:username`), Favorites, About, Contact, 404 — all client-side, lazy-loaded per route, with a page-transition animation.
- **State across pages:** `FavoritesContext` (React Context) persisted to `localStorage`; the navbar badge updates from any page.
- **API:** GitHub REST (`/search/users`, `/users/:name`, `/users/:name/repos`) with `fetch`, **debounced search** (450 ms), `AbortController` to cancel stale requests, loading / empty / rate-limit / network-error states, sort option, search kept in the URL (`?q=`).
- **Deploy:** `public/_redirects` (Netlify) and `vercel.json` provide the SPA fallback. Run `npm run build` and deploy `dist/`, or connect the repo to Netlify/Vercel.
  Note: unauthenticated GitHub API calls are limited to 60/hour per IP; the UI shows a clear message when that is hit.

## Level 3
### Performance — `level-3-performance`
`before/` is the Level 1 landing page plus an image gallery, deliberately left unoptimized (blocking script in `<head>`, 2.7 MB PNGs, no lazy loading). `npm run build` produces `after/`:
- PNG → responsive **WebP** (480/800/1200 w) with `srcset`, `sizes`, explicit `width/height`, `loading="lazy"`, `decoding="async"`
- **Minified** HTML/CSS/JS (esbuild, html-minifier-terser), **content-hashed** JS filename, script `defer`red
- Critical CSS **inlined** (no render-blocking stylesheet request)
- **Caching**: `_headers` (immutable, 1-year for hashed JS and images; revalidate for HTML); `scripts/serve.mjs` mirrors these plus gzip/brotli so before/after can be measured fairly
- `npm run lighthouse` runs Lighthouse (mobile emulation, median of 3 runs) on both.

| (localhost, Lighthouse mobile) | Score | FCP | LCP | TBT | CLS | Initial page weight |
|---|---|---|---|---|---|---|
| before | 100 | 0.9 s | 0.9 s | 0 ms | 0 | **10,660 KiB** |
| after  | 100 | 0.7 s | 0.9 s | 0 ms | 0 | **4 KiB** |

Both score 100 because localhost has no real network latency and the page is light — the clear win here is payload (≈ 99.96 % smaller up front; the gallery images download only when scrolled into view, at ~1.5–7 KiB each as WebP). Re-run Lighthouse on your deployed URL for numbers that reflect real networks.
Lighthouse also caught a real layout-shift bug (count-up stats changing width); it's fixed with `font-variant-numeric: tabular-nums` and reserved width.

### Animations — `level-3-animations`
GSAP + ScrollTrigger: intro **timeline** (staggered headline, button pop), scroll-scrubbed parallax + progress bar, staggered card entrances, a scrubbed timeline for the process steps, count-up numbers, **magnetic buttons** and **3D card tilt** on hover (`gsap.quickTo`, transform/opacity only → compositor-friendly).
Accessibility: honours `prefers-reduced-motion` live, plus an on-page **Pause/Play motion** toggle; content is fully visible with motion off; focus styles and skip link included.

## Before you submit
- Each level is in its own folder/file as requested; the Codveda submission form hasn't been shared yet.
- Push to GitHub (one repo or one per level) and deploy Level 2 (required by its brief) on Netlify.

