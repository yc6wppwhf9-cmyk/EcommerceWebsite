# Hands-On Code & UX Audit Report: Priority Bags Storefront

**Audited Repository:** `EcommerceWebsite-master`  
**Audit Date:** September 16, 2026  
**Overall Score:** **8.2 / 10**

---

## 1. Reconnaissance Summary

- **Frontend Stack:** React 19, Vite, TypeScript, Tailwind CSS v4, Motion, React Router v7.
- **Backend Stack:** Node.js 20+, Express, TypeScript (`tsx`), Zod v4, Supabase (PostgreSQL), Razorpay, Cloudinary, Anthropic Claude SDK, Resend/Nodemailer.
- **Hosting:** Vercel (Frontend + `/api/*` rewrite proxy), Render (Express API), Supabase (PostgreSQL).
- **Test Files Found:** Only **2 test files** in backend (`backend/src/lib/pricing.test.ts`, `backend/src/lib/support.service.test.ts`), **0 test files** in frontend.

### Largest Files ("God Components" > 500 Lines)
1. `frontend/src/pages/AdminDashboard.tsx` — **1,870 lines** (Monolithic admin hub: Products, Excel upload, Jobs, Applicants, Tickets, Users).
2. `frontend/src/pages/AboutUs.tsx` — **763 lines** (Marketing animations, counters, SVG maps, timeline).
3. `frontend/src/pages/CategoryPage.tsx` — **742 lines** (Multi-facet filter engine, pagination, product grid).
4. `frontend/src/pages/UserDashboard.tsx` — **709 lines** (Profile, multi-address book, order history, tickets).
5. `frontend/src/pages/JuniorPage.tsx` — **652 lines** (3D canvas physics, custom junior style carousel).
6. `frontend/src/pages/ProductDetail.tsx` — **620 lines** (Gallery viewer, variant switcher, specs, review modal).
7. `backend/src/schema.sql` — **558 lines** (Full PostgreSQL schema, indexes, functions).

---

## 2. Security Findings

- **Secrets Management (PASS):** No hardcoded keys/secrets in source files. Centralized in `backend/src/config/env.ts` and asserted at boot.
- **Client Auth Storage (PASS - High Standard):** JWT `access_token` and `refresh_token` stored strictly in `httpOnly` cookies with `secure` and `sameSite: 'lax'`. No tokens in `localStorage`.
- **Privilege Verification (PASS):** Server-side `authenticateToken` + `requireAdmin` middlewares enforced on all admin endpoints.
- **CSRF Protection (PASS):** Double-Submit Cookie CSRF (`validateCsrf`) wired on all 22 mutating backend routes and echoed by `frontend/src/lib/api.ts`.
- **Rate Limiting (PASS):** Multi-tier rate limiting for global API (500/15m), login/register (10/15m), AI chat (8/1m), and support (10/1h).
- **Injection Safety (PASS):** No `dangerouslySetInnerHTML`, no `eval()`, and query inputs are parameterized/escaped.
- **Internal Error Leaks (WARN):** Controller `catch` blocks in `product.controller.ts`, `user.controller.ts`, `jobs.controller.ts`, and `review.controller.ts` return raw `err.message` in 500 responses.

---

## 3. Code Quality & Architecture Findings

- **Dead Mock Data Functions:** `frontend/src/constants/products.ts` defines `const PRODUCTS = []` with 6 helper functions (`getProductById`, `getProductsByCategory`, etc.) that filter on this empty array.
- **Configuration Duplication:** Categories defined in `products.ts`, duplicated in `home.ts`, and seeded in `schema.sql`. Shipping thresholds re-declared in `Checkout.tsx`.
- **Network Resilience:** `api.ts` features in-memory caching (5-min TTL) and in-flight request deduplication.

---

## 4. Mobile & Responsive UX Findings

- **Viewport Meta Tag (PASS):** Pinch-to-zoom allowed (accessible). Missing `viewport-fit=cover`.
- **iPhone Safe-Area Insets (FAIL):** `frontend/src/components/MobileBottomNav.tsx` has no bottom safe-area padding (`env(safe-area-inset-bottom)`), causing navigation to sit directly on the iOS home bar.
- **iOS Safari Auto-Zoom Bug (FAIL):** **71 `<input>` elements** across `AuthModal.tsx`, `SearchModal.tsx`, `Careers.tsx`, `Policies.tsx`, and `UserDashboard.tsx` use `text-sm` (14px) or `text-xs` (12px), causing Mobile Safari to zoom in on focus.
- **Sub-12px Font Sizes (WARN):** `MobileBottomNav.tsx` tab labels are rendered at `text-[8.5px]`.
- **Tap Targets (WARN):** Wishlist button on standard product cards is 32×32px (below 44×44px recommendation).

---

## 5. Prioritized Action Plan

| Priority | Issue | Affected Files | Fix Summary |
|---|---|---|---|
| **P1** | iOS Safari Auto-Zoom on Form Inputs | `AuthModal.tsx`, `SearchModal.tsx`, `Careers.tsx`, `Policies.tsx`, `UserDashboard.tsx` | Upgrade input fonts to `text-base` (16px) on mobile or add global CSS rule. |
| **P2** | Mobile Bottom Nav iPhone Home Bar Overlap | `index.html`, `MobileBottomNav.tsx` | Add `viewport-fit=cover` and `pb-[env(safe-area-inset-bottom)]`. |
| **P3** | Tiny Bottom Nav Text & Small Tap Targets | `MobileBottomNav.tsx`, `ProductCard.tsx` | Bump nav labels to `text-[10px]` and increase touch hit areas to 44×44px. |
| **P4** | Decompose 1,870-line Admin God Component | `AdminDashboard.tsx` | Split into sub-components (`AdminProducts.tsx`, `AdminJobs.tsx`, `AdminSupport.tsx`). |
| **P5** | Sanitize 500 Database Error Leaks | `product.controller.ts`, `user.controller.ts`, `jobs.controller.ts` | Return generic error message in production instead of `err.message`. |
| **P6** | Add `.env.example` & Frontend Test Harness | `backend/.env.example`, `frontend/package.json` | Create `.env.example` and set up Vitest. |
