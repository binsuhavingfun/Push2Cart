# Push2Cart

Push2Cart is a retro pixel-art e-commerce app built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.

Motto: `Play. Shop. Save.`

Subtext: `Your cart just got more fun.`

## Features

- Homepage hero with pixel-art branding and dual CTAs
- Responsive desktop/mobile navbar with hamburger toggle on small screens
- Responsive product grid and dedicated product detail pages
- Guest cart via `localStorage` with automatic merge into logged-in Supabase cart
- Supabase email/password authentication
- Protected checkout with Cash on Delivery order creation and voucher redemption
- Order history and order tracking timeline
- Daily claw machine mini-game with animated claw states and generated sound effects
- Product review system with 1-5 star ratings and comments
- Admin order operations page for status updates
- Supabase-ready RLS policies for products, carts, orders, vouchers, and game plays

## New Features Added

- `Mobile Navbar Responsiveness Fix` with collapsible hamburger menu and auto-close behavior on navigation
- `My Reviews` account page: [http://localhost:3000/account](http://localhost:3000/account)
- `Admin Orders` operations page: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)
- `Product Reviews` on each product detail page (logged-in users can post 1-5 star reviews)
- `Voucher Redemption` at checkout (one voucher per order, marked used after placement)
- `Claw Machine Upgrade` with layered visuals, smooth motion states, and generated sound effects

## Project Structure

```text
app/           Next.js App Router pages and API routes
components/    Reusable UI building blocks
hooks/         Shared auth, cart, and toast state
lib/           Helpers, formatting, mock data, Supabase clients
supabase/      SQL schema and seed data
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example` and add your Supabase project values:

```bash
Copy-Item .env.local.example .env.local
```

3. Run the SQL in [`supabase/schema.sql`](/C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql) inside the Supabase SQL editor.

4. Optional admin setup:
   - Open Supabase SQL Editor and run:
   - `insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_ID') on conflict do nothing;`

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup Guide

1. Create a new Supabase project.
2. Enable Email auth in `Authentication > Providers`.
3. Run the schema from [`supabase/schema.sql`](/C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql).
4. Copy the project URL and anon key into `.env.local`.
5. The app now uses local product images from `public/images/*`.

## App Notes

- Product reads fall back to local mock data when Supabase is not configured yet.
- Checkout and mini-game routes redirect to `/auth` if there is no active session.
- The claw machine uses CSS animations and generated Web Audio sounds, not external audio assets.
- Voucher rewards are stored in `vouchers`, daily play counts are tracked in `game_plays`, and selected vouchers are marked as used on checkout.
- Product reviews are stored in `reviews` and linked to each product detail page.

## Mobile Navbar QA Checklist

Use this checklist before shipping navbar updates:

1. Run locally:

```bash
npm run dev
```

2. Open `http://localhost:3000`, then test mobile view (`375px`, `390px`, `430px`) using browser device tools.
3. Confirm expected behavior:
   - Hamburger icon is visible on mobile.
   - Menu opens and closes on tap.
   - Menu closes after selecting a link.
   - Content remains readable and is not blocked by nav when closed.
   - No horizontal overflow.
4. Confirm desktop view (`>=1024px`) still shows the normal full navigation.

## Navbar Code Walkthrough (Desktop + Mobile)

This section explains `components/navbar.tsx` block by block and why each part exists.

1. `use client`
- Why: the navbar uses React state, effects, and click handlers, so it must run on the client.

2. Imports (`useEffect`, `useState`, `Link`, `usePathname`, `useRouter`, hooks, Supabase client)
- Why: each import supports one navbar responsibility.
- `usePathname`: detects current route for active link styles.
- `useRouter`: allows redirect/refresh after logout.
- `useAuth`: reads signed-in user.
- `useCart`: shows live cart item count.
- Supabase browser client: checks admin role and signs out safely.

3. `links` array
- Why: keeps primary nav links in one reusable source (`Home`, `Products`, `Mini Game`, `About`, `Contact`).
- Benefit: adding/removing links only requires editing one array.

4. Component state
- `isAdmin`: controls whether admin link is shown.
- `isMobileMenuOpen`: controls mobile menu open/close state.
- Why: desktop and mobile need different visibility logic, but should share one nav source.

5. Admin check effect
- Queries `admin_users` with current `user.id`.
- Why: prevents showing admin link to non-admin users.
- Fallback behavior: if query fails, navbar defaults to non-admin (safer UI state).

6. Route-change effect (`setIsMobileMenuOpen(false)` on `pathname` change)
- Why: menu should auto-close after navigation so it does not stay open and block content on small screens.

7. Logout handler
- Calls Supabase `signOut()`, closes mobile menu, redirects to home, refreshes router.
- Why: ensures auth state and visible navbar links update immediately.

8. Reusable class constants (`baseLinkClasses`, `cartClasses`, `authLinkClasses`)
- Why: keeps styling consistent across desktop and mobile menus.
- Benefit: single edit point for shared visual rules in your pixel theme.

9. Header wrapper
- `fixed inset-x-0 top-0 z-40 ... backdrop-blur-md`
- Why: keeps navbar always visible while scrolling and layered above page content.
- Important: this works with top spacing in `app/layout.tsx` (`pt-28`) so content is not hidden under the fixed header.

10. Top row brand + mobile toggle
- Left: brand title/subtext.
- Right: hamburger button only on mobile (`lg:hidden`).
- Why: on small screens, full horizontal nav is replaced with a compact toggle to save vertical space.

11. Hamburger icon animation
- Three bars transform into an `X` when opened.
- Why: gives clear visual state (open vs closed) and improves usability.

12. Desktop navigation block
- `hidden ... lg:flex`
- Why: unchanged desktop behavior; full menu remains visible on large screens.
- Includes links, cart count, account/orders/admin/logout or login button.

13. Mobile navigation block
- `lg:hidden`, collapsible with `max-h` transition and `overflow-hidden`.
- Why: smooth open/close behavior without covering the whole page permanently.
- `max-h-[70vh]` + internal `overflow-y-auto`:
  - prevents viewport takeover on short screens
  - still allows scrolling inside menu if links/actions grow

14. Link click behavior (`onClick={closeMobileMenu}`)
- Why: after tapping any link on mobile, the menu closes immediately for better content visibility.

15. Accessibility attributes
- `aria-label`, `aria-expanded`, `aria-controls`, plus `sr-only` label.
- Why: screen readers can understand menu button state and relationship to the menu panel.

16. Desktop behavior summary
- Full nav always visible at `lg` and above.
- Active link styling uses current route.
- Auth/admin/cart actions remain directly accessible.

17. Mobile behavior summary
- Compact header shows brand + hamburger.
- Menu opens/closes predictably.
- Menu auto-closes on route change and link taps.
- Content stays readable when menu is closed.

## GitHub and Vercel Deploy Checklist

1. Build test from project root:

```bash
npm run build
```

2. Commit and push:

```bash
git add components/navbar.tsx README.md
git commit -m "fix(navbar): improve mobile responsiveness and document QA steps"
git push origin main
```

3. In Vercel, open `Deployments` and confirm latest deployment status is `Ready`.
4. Re-test production URL on a phone or mobile emulator.

## Environment Variable Safety

- Never commit `.env.local`.
- Keep these in Vercel Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Do not expose service keys in `NEXT_PUBLIC_*` variables.
- If env values are changed in Vercel, redeploy before retesting.



