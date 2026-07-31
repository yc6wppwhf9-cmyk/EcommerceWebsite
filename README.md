# Priority Bags

E-commerce storefront for [Priority Bags](https://prioritybags.in) — backpacks, luggage and travel
accessories by High Spirit Commercial Ventures Pvt. Ltd.

Products are browsed and compared on this site, then purchased on Amazon: each product links out to
its Amazon listing, and outbound clicks are tracked to drive bestseller ranking. The codebase also
carries a full first-party checkout (cart, coupons, Razorpay, order lifecycle) which is built and
tested but not the primary path today.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Motion, React Router |
| Backend | Node, Express, TypeScript (run directly via `tsx`) |
| Database | Supabase (PostgreSQL) |
| Media | Cloudinary |
| Payments | Razorpay |
| Email | Resend / SMTP |
| Assistant | Anthropic API (in-app product chat) |

The repository is an **npm workspaces monorepo** with two packages: `frontend` and `backend`.

---

## Getting started

**Prerequisites:** Node 20+ and npm 9+ (workspaces are required).

```bash
git clone https://github.com/yc6wppwhf9-cmyk/EcommerceWebsite.git
cd EcommerceWebsite
npm install                      # installs both workspaces from the root
cp backend/.env.example backend/.env
```

Fill in `backend/.env` (see [Environment](#environment)), then:

```bash
npm run dev                      # frontend on :3000, backend on :4000
```

The Vite dev server proxies `/api/*` to `http://localhost:4000`, so the browser talks to one origin
and cookies stay same-origin. Leave `VITE_API_URL` unset locally.

### Scripts

Run from the repository root:

| Command | Does |
|---|---|
| `npm run dev` | Both services concurrently |
| `npm run dev:frontend` | Vite dev server only |
| `npm run dev:backend` | Express API only |
| `npm run build:frontend` | Production build to `frontend/dist` |

Per workspace:

```bash
npm run lint --workspace=priority-bags-frontend    # tsc --noEmit
npm run lint --workspace=priority-bags-backend
npm test --workspace=priority-bags-backend         # node:test via tsx
```

---

## Environment

All secrets live in `backend/.env`, which is git-ignored — **never commit it.** `backend/.env.example`
lists every key; the ones without a safe default are:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Database access (service role — server only, never expose to the browser) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Auth token signing |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Product image hosting |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments |
| `RESEND_API_KEY` or `SMTP_*` | Transactional email |
| `ANTHROPIC_API_KEY` | Product chat assistant |
| `CORS_ORIGIN`, `FRONTEND_URL` | Must match the deployed frontend origin |

---

## Project layout

```
frontend/
  src/
    components/     Header, Footer, ProductCard, SearchModal, CartDrawer, ChatBot…
    pages/          Home, CategoryPage, ProductDetail, Checkout, Policies, Admin…
    context/        Auth, Cart, Wishlist
    lib/            api client, shared motion variants
    index.css       Tailwind v4 @theme — design tokens live here
backend/
  src/
    routes/         One router per domain (product, order, payment, auth, support…)
    controllers/    Request handling and validation
    lib/            Mail, support tickets, sanitisation, errors
    middleware/     Auth, rate limiting
    scripts/        Catalogue import and readiness checks
    schema.sql      Tables, indexes and stock functions
```

### Design tokens

Colour and typography are defined once in `frontend/src/index.css` under Tailwind's `@theme`
block, then used as utilities (`bg-bone`, `text-ink`, `bg-marine`). The catalogue uses a
neutral-dominant palette — roughly 90% neutral, 8% marine accent, 2% brass — with the brand blue
reserved for interactive elements rather than large fills.

Two surfaces deliberately opt out and keep their own identity: **Junior** (orange) and **Premium /
Traworld** (black). Components branch on a `theme` prop rather than being restyled globally, so
those sub-brands stay distinct.

### Motion

Shared variants live in `frontend/src/lib/motion.ts`: expo-out easing, 0.35–0.8s durations, small
travel distances. Scroll reveals fire once. All of it respects `prefers-reduced-motion` via
`revealProps()`.

---

## Deployment

| Service | Host | Notes |
|---|---|---|
| Frontend | Vercel | Builds `frontend`, output `dist` |
| Backend | Render | Runs `npm start` (Express via `tsx`) |
| Database | Supabase | Managed PostgreSQL |

`frontend/vercel.json` rewrites `/api/*` to the Render backend and serves `index.html` for all other
routes (SPA fallback). **If the backend host changes, update that rewrite target** — the frontend
has no other way to reach the API in production.

### Commit authorship

Vercel blocks production deploys when the commit author email is not linked to the GitHub account.
Commit as `admin@hscvpl.com`.

---

## Notes for contributors

- **Never cast raw API rows to `Product`.** Supabase returns a joined `categories: { slug, title }`
  object, not a flat `category` string. Casting hides the difference from the compiler and it fails
  at runtime instead — map the row (`categories?.slug ?? sub_category ?? ''`) as `ProductDetail` does.
- **Amazon CTAs must be real anchors**, not `window.open()`. iOS Universal Links and Android App
  Links only hand off to the installed Amazon app on a genuine user-initiated navigation; a tab
  opened from script stays in the browser. Use the `AmazonLink` component.
- **Form inputs need 16px on mobile**, or iOS Safari zooms on focus.
- **Product imagery carries baked-in text** in some creatives (category tiles, some hero slides).
  Those words cannot be removed in code — they need the artwork re-exported.

---

© High Spirit Commercial Ventures Pvt. Ltd. All rights reserved.
