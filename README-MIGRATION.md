# BOWT — Vite/React → Next.js Migration

This project was converted from the original Vite + React Router app to
**Next.js 14 (Pages Router)**.

## Why Pages Router (not App Router)

This app is almost entirely client-interactive (booking flow, Supabase auth,
admin dashboard with forms/CRUD, GTM). App Router's main benefit — React
Server Components — wouldn't help much here and would force a "use client"
directive on nearly every file. Pages Router gives the same file-based
routing and is a much lower-risk migration for this codebase: `useRouter()`
from `next/router` maps cleanly onto the old `useNavigate`/`useParams`/
`useLocation` calls, and `react-helmet` maps directly onto `next/head`.

## What changed

- **Routing**: `src/App.jsx` (React Router `<Routes>`) → file-based routes
  under `pages/`. Original page components live in `src/screens/` (renamed
  from `src/pages` to avoid colliding with Next's own `pages/` convention);
  each `pages/**/*.jsx` file is a thin wrapper that imports the matching
  screen.
- **`useNavigate` → `useRouter()`**, **`useParams()` → `router.query`**,
  **`useLocation()` → `router.pathname`/`router.asPath`**, **`<Link to=` →
  `<Link href=`**.
- **`react-helmet` → `next/head`** (drop-in replacement, same children-based
  API).
- **`import.meta.env.VITE_X` → `process.env.NEXT_PUBLIC_X`**,
  **`import.meta.env.DEV` → `process.env.NODE_ENV !== 'production'`**.
- **Booking flow state**: React Router's `navigate(path, { state })` /
  `location.state` has no Next.js equivalent. Replaced with a small
  `sessionStorage` wrapper, `src/lib/bookingState.js`
  (`getBookingState` / `setBookingState` / `clearBookingState`), used across
  `BookingForm.jsx` → `PricePageRoute` → `VehicleSelectionPage` →
  `CustomerDetailsPage` → `ConfirmationPage` and `RouteDetailsPage`'s
  "Book Now" button. Each step merges its own fields in; `ConfirmationPage`
  clears it on unmount so a fresh booking starts clean.
- **Sitemaps**: the old `SitemapRoute` / `CitiesSitemap` / `RoutesSitemap`
  screens rendered XML text inside a React `<pre>` tag as a client-side
  "best effort" (their own code comments said as much, since a Vite SPA
  has no server to set real response headers). Next.js has a real server,
  so these are now `pages/sitemap.xml.jsx`, `pages/sitemap-cities.xml.jsx`,
  and `pages/sitemap-routes-[page].xml.jsx`, each using
  `getServerSideProps` to fetch the XML from Supabase storage and return it
  with a proper `Content-Type: application/xml` header. This is a genuine
  improvement over the original, not just a port.
- **Legacy redirects**: `/route-selection`, `/vehicle-selection`,
  `/confirmation`, `/admin/routes/new`, and `/booking` → now handled by
  `next.config.js`'s `redirects()` instead of `<Navigate>` route elements.
- **Auth guard**: the old `<Outlet>`-based protected route wrapper is now
  `src/components/auth/ProtectedRoute.jsx`, used inside each `/admin/*`
  page (`<ProtectedRoute><AdminDashboard /></ProtectedRoute>`).

## Dead code found (not migrated, left in `src/screens/` untouched)

These files existed in the original repo but were **not referenced** by
`App.jsx`'s routes, so they were never reachable in the live app:
`BookingFormPage.jsx`, `RouteAndPriceSelectionPage.jsx`, `RoutePage.jsx`,
`RoutesListingPage.jsx`, `RoutesPage.jsx`. They still contain
un-migrated `useLocation`/`useNavigate` calls — safe to delete, or finish
migrating them yourself if you actually need them.

## Before you deploy — please verify

This was migrated file-by-file without a working `npm install`/`npm run
build` in this environment (no network access), so treat it as a strong
first draft, not a guaranteed-green build:

1. `npm install`, then `npm run dev` and click through the whole booking
   flow end to end (route-selection → price → vehicle-selection →
   customer-details → confirm), plus `/admin` login and CRUD screens.
2. All `react-router-dom` imports were rewritten and manually verified
   (no leftover `react-router-dom`, `useLocation()`, `useNavigate()`, or
   `useParams()` calls outside the 5 dead-code files listed above) — but
   a fresh pair of eyes on the diff never hurts, especially in the admin
   CRUD screens.
3. Double-check `next.config.js` if you use next/image anywhere later —
   it isn't used yet, so no `images.domains` config was needed.
4. The Supabase URL/anon key are hardcoded in `src/lib/customSupabaseClient.js`
   (that's how the original app had it too — not something this migration
   changed). Consider moving them to env vars now that you're touching this
   file anyway.

## Environment variables

`src/utils/gtm.js` already has working fallback defaults for
`NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GOOGLE_ADS_ID`, so the app runs without
any `.env.local` file. See `.env.local.example` if you want to override them.
