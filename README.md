# Push2Cart

Push2Cart is a retro pixel-art e-commerce app built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.

Motto: `Play. Shop. Save.`

Subtext: `Your cart just got more fun.`

## Platform Overview

Push2Cart offers a simple shopping experience with fun reward moments along the way. The pixel-style design stays focused on useful interactions so everything remains clear and easy to use—paano naman sa mobile? Smooth din. Built in the Philippines, Push2Cart keeps things playful without being over naman sa ask for everyday use.

## Homepage Featured Description

A selection of gear you can easily check out and add to your setup. Everything stays simple and fun to explore without being over naman sa ask.

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
## Available Scripts

- `npm run dev`: start local development server.
- `npm run build`: create production build (recommended before deploy).
- `npm start`: run production server after build (if configured in your project).
- `npm run lint`: run lint checks (if configured in your project).

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


## Complete Code Walkthrough

This section explains the role of each major code area and why it is implemented that way.

1. App Router pages (`app/*`)
- `app/layout.tsx`: global shell wrapper for providers, background effects, fixed navbar, and main content spacing.
- `app/globals.css`: global Tailwind and theme-level styles shared across all routes.
- `app/page.tsx`: homepage entry with hero and featured sections.
- `app/about/page.tsx`, `app/contact/page.tsx`: static marketing/info pages.
- `app/products/page.tsx`: product listing page that feeds from Supabase or fallback data.
- `app/products/[id]/page.tsx`: product detail page per item id with add-to-cart and reviews.
- `app/cart/page.tsx`: cart page container for cart UI actions.
- `app/checkout/page.tsx`: checkout page with voucher and order placement flow.
- `app/auth/page.tsx`: authentication page for sign in/sign up flows.
- `app/orders/page.tsx`, `app/orders/[id]/page.tsx`: customer order list and individual order status tracking.
- `app/account/page.tsx`: account overview and user-related actions.
- `app/admin/orders/page.tsx`: admin order management UI.
- `app/game/page.tsx`: claw machine game page.
- `app/not-found.tsx`: custom 404 route fallback.
- `app/supabase-example/page.tsx`: sandbox/example page for Supabase usage.

2. API routes (`app/api/*`)
- `app/api/orders/route.ts`: create/read order requests.
- `app/api/reviews/route.ts`: review submission and retrieval endpoints.
- `app/api/vouchers/route.ts`: voucher issuance/redeem checks.
- `app/api/game/play/route.ts`: game play result handling and reward logic.
- `app/api/admin/orders/[id]/route.ts`: admin-only order status updates.
- `app/api/reports/route.ts`: bug/feedback report submission, email notification, and optional DB insert.
- Why these exist: keeps sensitive operations server-side and centralizes business logic.

3. Reusable UI components (`components/*`)
- `navbar.tsx`: fixed responsive navigation for desktop and mobile, auth-aware links, and cart count.
- `hero-section.tsx`, `section-heading.tsx`: reusable homepage/section framing in pixel style.
- `product-grid.tsx`, `product-card.tsx`, `add-to-cart-button.tsx`: storefront browsing and add-to-cart flow.
- `product-reviews.tsx`: review list and submission UI.
- `cart-view.tsx`: line items, quantity controls, totals, and cart actions.
- `checkout-form.tsx`: checkout details and voucher application UI.
- `order-list.tsx`, `order-status-timeline.tsx`: order history and progress display.
- `auth-forms.tsx`: login/register UI.
- `claw-machine.tsx`: mini-game visuals, state transitions, and user actions.
- `admin-orders-table.tsx`: admin order controls and status update interface.
- `providers.tsx`: app-wide context composition (auth/cart/toast).
- Why this structure: keeps page files thin and reuses UI logic consistently.

4. State and hooks (`hooks/*`)
- `use-auth.tsx`: current user/session state and auth change tracking.
- `use-cart.tsx`: cart state, storage sync, and cart mutation helpers.
- `use-toast.tsx`: transient UI notifications.
- Why hooks exist: shared cross-page state and behavior without duplicating logic.

5. Business logic and data helpers (`lib/*`)
- `products.ts`, `mock-data.ts`: product retrieval and fallback data source.
- `types.ts`: shared TypeScript contracts used across pages/components/api.
- `format.ts`: currency/date/text format helpers.
- `auth.ts`, `admin.ts`: auth/admin guard and helper logic.
- `utils.ts`: generic utility helpers (class merging, small helpers).
- `shipping.ts`: checkout validation, Metro Manila/provincial detection, and address normalization helpers.
- `supabaseClient.ts` and `lib/supabase/{client,server,middleware}.ts`: Supabase clients for browser, server, and middleware contexts.
- Why this layer exists: isolates business/data logic from presentation components.

6. Data model and SQL (`supabase/*`)
- SQL schema, seed, and policy setup for products, carts, orders, reviews, reports, vouchers, and gameplay tables.
- Why this exists: reproducible backend setup and clear data contract for the app.

7. Navigation behavior architecture (desktop + mobile)
- Desktop (`lg` and above): full inline nav remains visible for quick access.
- Mobile (`<lg`): hamburger-driven collapsible menu prevents content obstruction.
- Route-change auto-close: ensures menu never stays open after navigation.
- Why: optimized usability per screen size while preserving one consistent nav system.

8. Auth and role-based UI behavior
- Signed-out users see login action.
- Signed-in users see account/orders/logout actions.
- Admin users additionally see admin navigation/action links.
- Why: keeps UI aligned to permissions and avoids exposing admin controls broadly.

9. Styling system and design consistency
- Tailwind utility classes drive responsive layout and spacing.
- Pixel theme classes preserve visual identity across components.
- Why: fast iteration with consistent brand styling and fewer custom CSS overrides.

10. End-to-end user flow summary
- Discover products -> add to cart -> authenticate -> checkout with voucher -> track orders -> optionally play game for rewards -> report bugs/feedback when needed.
- Why this matters: each module is designed to support one connected commerce + game experience.

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

## Shipping Address Validation System

Checkout now uses structured shipping fields and basic validation before an order can be submitted.

Required fields:
- `full_name`
- `phone_number`
- `street_address`
- `barangay`
- `city`
- `province`
- `postal_code`

Optional field:
- `delivery_notes`

Validation rules:
- City must not be empty.
- Province must not be empty.
- Postal code must be numeric only.
- Phone number must match PH format:
  - `09XXXXXXXXX`
  - `+639XXXXXXXXX`

Validation messages are shown inline in checkout (example: `Please enter a valid barangay.`).

Metro Manila vs provincial delivery detection:
- If `province` equals `Metro Manila` (case-insensitive), estimate is `2-4 days`.
- Otherwise estimate is `4-7 days`.

Checkout shows this immediately after province input:
- `Estimated delivery: 2-4 days (Metro Manila)`
- or `Estimated delivery: 4-7 days (Provincial area)`

Delivery notes:
- Checkout includes an optional notes field for landmark/gate instructions.
- Saved to Supabase as `delivery_notes`.

Supabase storage (orders table):
- `full_name`
- `phone_number`
- `street_address`
- `barangay`
- `city`
- `province`
- `postal_code`
- `delivery_notes`

Migration/update instructions:
1. Open Supabase SQL Editor.
2. Run the latest [`supabase/schema.sql`](/C:/Users/vinci/Documents/Push2Cart-git/supabase/schema.sql) to ensure new address columns exist.
3. Existing orders remain compatible because legacy `address` is still retained for fallback display.

## Bug Report and Feedback System

Users can report bugs or submit website feedback using the **Report an Issue** page.

- Reports are sent to: `vincetarogpaglicawan@gmail.com`
- A report may include: name, email, report type, and message
- Reports are stored in the database under the `reports` table
- This feature helps improve usability and detect issues early
- Implemented routes:
  - Page: `/report`
  - API: `POST /api/reports`
- Contact page includes a direct shortcut to the report form
- To enable storage, run the latest [`supabase/schema.sql`](/C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql) in Supabase SQL Editor
- Email notifications are sent via Resend API in the server route
- Email payload includes report type, name, email, message, and timestamp
- Email subject format: `[Push2Cart Report] Bug / Feedback / Suggestion`

## .env.local.example Keys

Use this as a safe template (keys only, no real secrets):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
REPORT_RECEIVER_EMAIL=vincetarogpaglicawan@gmail.com
REPORT_FROM_EMAIL="Push2Cart Reports <onboarding@resend.dev>"
```

Optional server-only key (never expose in public client code):

```env
SUPABASE_SERVICE_ROLE_KEY=
```

## Implementation Reference (Code + SQL)

This section documents the exact code and SQL added for:
- Shipping Address Validation System
- Bug Report and Feedback System

### 1. Checkout form updates

File: [components/checkout-form.tsx](/C:/Users/vinci/Documents/Push2Cart/components/checkout-form.tsx)

What was added:
- Structured shipping fields:
  - `fullName`, `phoneNumber`, `streetAddress`, `barangay`, `city`, `province`, `postalCode`, `deliveryNotes`
- Validation before submit using `validateShippingAddress(...)`
- Delivery estimate preview using `getDeliveryEstimate(province)`
- Grouped UI sections:
  - `Shipping Information`
  - `Delivery Address`
  - `Delivery Notes`

Why:
- Prevent incomplete/invalid checkout addresses.
- Show users expected delivery window instantly.
- Keep form readable on mobile and desktop.

### 2. Shared shipping validation and estimate logic

File: [lib/shipping.ts](/C:/Users/vinci/Documents/Push2Cart/lib/shipping.ts)

What was added:
- `validateShippingAddress(input)`
  - required field checks
  - PH phone validation (`09XXXXXXXXX` or `+639XXXXXXXXX`)
  - numeric postal code validation
- `getDeliveryEstimate(province)`
  - `Metro Manila` => `2-4 days`
  - all others => `4-7 days`
- `buildAddressLine(input)` for legacy/fallback combined address text.

Why:
- Keep all shipping rules in one reusable place.
- Use the same logic in UI and API to avoid mismatched behavior.

### 3. Order API validation + storage changes

File: [app/api/orders/route.ts](/C:/Users/vinci/Documents/Push2Cart/app/api/orders/route.ts)

What was added:
- Server-side shipping validation (same rules as client).
- Structured address fields saved into `orders` table:
  - `phone_number`, `street_address`, `barangay`, `city`, `province`, `postal_code`, `delivery_notes`
- Fallback `address` string is still saved for compatibility.
- Delivery estimate returned in response payload.

Why:
- Server validation protects against bypassing client checks.
- Structured columns make filtering/reporting/address handling cleaner.

### 4. Order display compatibility updates

Files:
- [app/orders/[id]/page.tsx](/C:/Users/vinci/Documents/Push2Cart/app/orders/[id]/page.tsx)
- [app/admin/orders/page.tsx](/C:/Users/vinci/Documents/Push2Cart/app/admin/orders/page.tsx)
- [components/admin-orders-table.tsx](/C:/Users/vinci/Documents/Push2Cart/components/admin-orders-table.tsx)
- [lib/types.ts](/C:/Users/vinci/Documents/Push2Cart/lib/types.ts)

What was added:
- Types for new structured fields.
- Display of structured address where available.
- Fallback to old `address` value for older records.
- Delivery notes/contact display in order detail.

Why:
- Prevent breaking older orders after schema changes.
- Keep admin and customer views consistent.

### 5. Report page UI

File: [app/report/page.tsx](/C:/Users/vinci/Documents/Push2Cart/app/report/page.tsx)

What was added:
- New route: `/report`
- Form fields:
  - Name (optional)
  - Email (optional)
  - Report Type (`Bug Report`, `Website Feedback`, `Suggestion`)
  - Message (required)
- Submit button label: `Send Report`
- Success message:
  - `Thanks for the report. We appreciate your feedback.`

Why:
- Separate bug/feedback reporting from product reviews.
- Provide a simple public support channel.

### 6. Report API (email + DB)

File: [app/api/reports/route.ts](/C:/Users/vinci/Documents/Push2Cart/app/api/reports/route.ts)

What was added:
- New endpoint: `POST /api/reports`
- Input validation:
  - report type required
  - message required
  - email format check when provided
- Email sending via Resend API:
  - recipient: `REPORT_RECEIVER_EMAIL` (defaults to `vincetarogpaglicawan@gmail.com`)
  - subject: `[Push2Cart Report] Bug|Feedback|Suggestion`
  - body includes report type, name, email, message, timestamp
- Optional Supabase storage in `reports` table.

Why:
- Developers get immediate email alerts.
- Database keeps a searchable issue/feedback history.

### 7. Navigation integration

Files:
- [components/navbar.tsx](/C:/Users/vinci/Documents/Push2Cart/components/navbar.tsx)
- [app/contact/page.tsx](/C:/Users/vinci/Documents/Push2Cart/app/contact/page.tsx)

What was added:
- Navbar link: `Report` -> `/report`
- Contact page CTA: `Open Report Form`

Why:
- Makes report feature easy to find for users.

### 8. Supabase schema updates

File: [supabase/schema.sql](/C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql)

Shipping columns added to `orders`:
```sql
alter table public.orders add column if not exists phone_number text;
alter table public.orders add column if not exists street_address text;
alter table public.orders add column if not exists barangay text;
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists province text;
alter table public.orders add column if not exists postal_code text;
alter table public.orders add column if not exists delivery_notes text;
```

Reports table + policies:
```sql
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  report_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create policy "Anyone can submit reports"
on public.reports
for insert
to public
with check (true);

create policy "Admins can read reports"
on public.reports
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
```

Why:
- Shipping columns support structured delivery data.
- `reports` table captures bug/feedback submissions.
- Policies allow public inserts while restricting reads to admins.

### 9. Environment variables used by report system

```env
RESEND_API_KEY=
REPORT_RECEIVER_EMAIL=vincetarogpaglicawan@gmail.com
REPORT_FROM_EMAIL="Push2Cart Reports <onboarding@resend.dev>"
```

Why:
- `RESEND_API_KEY`: authenticates email send requests.
- `REPORT_RECEIVER_EMAIL`: developer inbox destination.
- `REPORT_FROM_EMAIL`: sender identity shown in mailbox.

## Claw Machine Behavior Update

- Before dropping, the claw now moves left-right automatically across the machine.
- The player controls when to drop by pressing the `Drop Claw` button.
- On button press, horizontal movement locks, then the claw pauses briefly and drops from its current position.
- The sequence continues with grab, lift, short suspense pause, and then result reveal while keeping the existing win/lose logic.
- Reward is revealed only after a successful catch and lift completion to improve suspense and realism.
- A lightweight confetti effect appears only on confirmed wins.
- A custom non-copyright arcade-style win jingle plays only when the reward is revealed.
- Lose states do not trigger reward reveal, confetti, or win jingle.
- The updated behavior is tuned for both desktop and mobile interactions.

## Troubleshooting

1. git is not recognized
- Install Git for Windows, reopen terminal, then run git --version.

2. Build fails on Vercel
- Check Deployments -> latest deploy -> Build Logs.
- Fix the first error shown, commit, and redeploy.

3. Supabase connection/auth not working
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly in Vercel.
- Ensure values are added to the correct environments (Production, Preview, Development).

4. Images not showing in production
- Ensure assets are in public/ and referenced as /images/....
- Confirm file names and casing match exactly.

5. Mobile navbar still blocks content
- Confirm updated components/navbar.tsx is pushed to GitHub.
- Hard refresh browser (Ctrl+F5) and retest on mobile width.



