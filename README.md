# Push2Cart

Push2Cart is a retro pixel-art e-commerce app built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.

Motto: `Play. Shop. Save.`

Subtext: `Your cart just got more fun.`

## Platform Overview

Push2Cart is a gamified shopping website with a retro arcade style. Users can browse products, play the claw machine, earn vouchers, and track their orders in one place.

## Homepage Featured Description

Browse a few featured picks, grab what you like, and keep shopping simple.

## Features

- Homepage hero with pixel-art branding and dual CTAs
- Responsive single-row desktop navbar with visible `Play. Shop. Save.` tagline and a hamburger menu on small screens
- Responsive product grid and dedicated product detail pages
- Guest cart via `localStorage` with automatic merge into logged-in Supabase cart
- Supabase email/password authentication
- Protected checkout with Cash on Delivery order creation and voucher redemption
- Customer profile page with account details, order history, purchase history, vouchers, settings, and in-page logout
- Order history and order tracking timeline
- Daily claw machine mini-game with automatic left-right claw movement, timed drop play, and generated sound effects
- Product review system with 1-5 star ratings and comments
- Admin dashboard, admin orders view, and admin reports management pages
- Footer with helpful links plus creator contact details
- About and Report pages with built-in pixel illustrations
- Supabase-ready RLS policies for products, carts, orders, vouchers, and game plays

## Implemented UI and Routes

- Navbar:
  - Guest: `Home`, `Products`, `Mini Game`, `About`, `Report`, `Login`
  - Customer: `Home`, `Products`, `Mini Game`, `About`, `Report`, `Cart`, `Profile`
  - Admin: `Dashboard`, `Orders`, `Reports`, `Logout`
- Footer:
  - Push2Cart branding
  - `Play. Shop. Save.` tagline
  - Helpful links: `About`, `Products`, `Mini Game`, `Report`
  - Creator contact details: email, GitHub, support hours
- Customer profile route: `/account`
  - `My Account`
  - `My Orders`
  - `Purchase History`
  - `Vouchers`
  - `Settings`
  - `Logout`
- Customer order routes:
  - `/orders`
  - `/orders/[id]`
- Admin routes:
  - `/admin`
  - `/admin/orders`
  - `/admin/orders/[id]`
  - `/admin/reports`
- Support route:
  - `/report`

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
- Footer now shows Push2Cart branding, helpful links, creator contact details, GitHub (`https://github.com/binsuhavingfun`), and support hours.

## Role Separation

- Guests can browse products and use the guest cart.
- Customers can shop, check out, view order tracking, manage vouchers, and use the customer profile page.
- Admins are redirected away from customer-only routes like checkout, customer orders, vouchers, and the mini game.
- Admin accounts get a management-focused experience through `/admin`, `/admin/orders`, and `/admin/reports`.
- Admin accounts cannot place customer orders, submit product reviews, use customer vouchers, or play the reward mini game.

## Claw Capsule Meaning

The six items shown at the bottom of the claw machine are capsule types:
- `Yizz`
- `Nux`
- `Lucky`
- `GG`
- `67`
- `Sheesh`

What they mean in gameplay:
- The claw's horizontal position at drop time maps to one of these capsules.
- That capsule is sent to the server as `targetCapsule`.
- Each capsule has its own reward profile (`winChance`, `rareChance`, and discount ranges).
- The final voucher label shows this source, for example: `12% Off Lucky Voucher`.

Important note:
- This does not guarantee a specific reward every time.
- It controls the probability profile used for that round, so timing still matters.

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
4. Confirm desktop view (`>=1024px`) keeps the logo, visible `Play. Shop. Save.` tagline, main navigation, and account actions on one balanced row.

## Navbar Code Walkthrough (Desktop + Mobile)

This section explains the current `components/navbar.tsx` structure at a higher level.

1. Brand and motto
- The `Push2Cart` logo and `Play. Shop. Save.` tagline stay visible together on the website.
- On admin routes the logo text switches to `Push2Cart Admin`.

2. Single-row desktop layout
- On desktop, the logo, main navigation, and auth/account actions share one balanced row.
- Guest users see the main store links and `Login`.
- Signed-in shoppers see the store links plus `Cart` and `Profile`.
- Signed-in admins see dashboard-focused navigation and `Logout`.

3. Mobile behavior
- On smaller screens the navbar collapses into the brand area plus a hamburger toggle.
- Opening the menu reveals the same route set in a vertical stack.
- The menu closes automatically on navigation so it does not block page content.

4. Shared route logic
- Primary shopper links live in one shared array and admin links live in a separate array.
- This keeps the navbar easier to maintain when link labels change.

5. Auth and role handling
- The navbar reads the current session from the auth hook.
- It checks `admin_users` in Supabase to decide whether to render shopper or admin navigation.
- Customer logout lives inside the profile page.
- Admin logout stays available directly from the admin navbar.

6. Styling and responsiveness
- The navbar keeps the pixel/retro arcade styling, balanced spacing, and active-link highlighting.
- Desktop uses inline navigation; mobile uses a collapsible panel with accessible button labels.
- Menu auto-closes on route change and link taps.
- Content stays readable when menu is closed.


## Visual Page Notes

- About page:
  - Uses friendlier product copy for the main description
  - Keeps the technical stack in a smaller `Built With` section
  - Includes a frontend-built pixel laptop illustration with code on screen
- Report page:
  - Uses a two-column layout with the report form on one side
  - Includes a frontend-built shopping cart carrying feedback/message cards
- Mini game page:
  - The claw starts sweeping left and right automatically
  - Players time the button press to drop the claw
  - The claw stays visually attached to the rail/cable assembly
  - The sweep restarts cleanly after the result flow

## Changed Components and Pages

- Navigation and shell:
  - `components/navbar.tsx`
  - `components/footer.tsx`
  - `app/layout.tsx`
- Customer account flow:
  - `app/account/page.tsx`
  - `components/profile-logout-button.tsx`
  - `app/orders/page.tsx`
  - `app/orders/[id]/page.tsx`
- Admin management flow:
  - `app/admin/page.tsx`
  - `app/admin/orders/page.tsx`
  - `app/admin/orders/[id]/page.tsx`
  - `app/admin/reports/page.tsx`
- Marketing/support pages:
  - `app/about/page.tsx`
  - `app/report/page.tsx`
  - `app/contact/page.tsx`
- Shopping and role-aware product UI:
  - `app/cart/page.tsx`
  - `app/checkout/page.tsx`
  - `app/products/[id]/page.tsx`
  - `components/add-to-cart-button.tsx`
  - `components/product-reviews.tsx`
- Mini game:
  - `components/claw-machine.tsx`
- Role checks and API protections:
  - `lib/admin.ts`
  - `hooks/use-admin-status.tsx`
  - `app/api/orders/route.ts`
  - `app/api/reviews/route.ts`
  - `app/api/game/play/route.ts`
  - `app/api/vouchers/route.ts`

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
- Footer keeps creator contact information while the navbar keeps the user-facing `Report` action easy to find

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
- The prize now appears inside the claw machine screen only after a successful catch and lift completion to improve suspense and realism.
- The exact reward won is shown clearly to the player (voucher value/label and voucher code).
- A congratulations message and a small `yay` text appear only after a successful win.
- A lightweight confetti effect appears only on confirmed wins.
- A custom non-copyright arcade-style win jingle plays only when the reward is revealed.
- A short non-copyright sad loss sound plays only on confirmed losses.
- Lose states do not trigger reward reveal, congratulations text, `yay`, confetti, or win jingle.
- All result feedback is timed to appear only after the animation sequence finishes.
- The updated behavior is tuned for both desktop and mobile interactions.
- Mobile layout was improved so players can see the claw gameplay area and `Drop Claw` controls together without needing to scroll during active play.

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

## Order Management and Security Review

### Current order management

- Orders are stored in Supabase tables: `orders` for the main record and `order_items` for line items in [supabase/schema.sql](C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql).
- Operational monitoring tables now also include `order_status_events` for lifecycle history and `security_events` for blocked or suspicious actions.
- Checkout is handled by [components/checkout-form.tsx](C:/Users/vinci/Documents/Push2Cart/components/checkout-form.tsx), which posts to [app/api/orders/route.ts](C:/Users/vinci/Documents/Push2Cart/app/api/orders/route.ts).
- After checkout, the API validates shipping data, rate-limits the request, then calls the `create_order_with_items` Postgres function to create the order, insert `order_items`, deduct stock, mark a selected voucher as used, clear the user cart, and redirect the user to [app/orders/[id]/page.tsx](C:/Users/vinci/Documents/Push2Cart/app/orders/[id]/page.tsx).
- Order records currently include full name, phone, structured delivery address, ordered products, quantity, total price, order status, payment method, payment status, and order timestamp.
- Order records now snapshot customer email, and the lifecycle supports `pending`, `confirmed`, `preparing`, `shipped`, `out for delivery`, `delivered`, and `cancelled`.
- Admin order management exists at [app/admin/orders/page.tsx](C:/Users/vinci/Documents/Push2Cart/app/admin/orders/page.tsx) with the table UI in [components/admin-orders-table.tsx](C:/Users/vinci/Documents/Push2Cart/components/admin-orders-table.tsx).
- Admins can update status through [app/api/admin/orders/[id]/route.ts](C:/Users/vinci/Documents/Push2Cart/app/api/admin/orders/[id]/route.ts), and a dedicated admin order details page now lives at [app/admin/orders/[id]/page.tsx](C:/Users/vinci/Documents/Push2Cart/app/admin/orders/[id]/page.tsx).

### Current security posture

- Authentication is handled by Supabase Auth in [components/auth-forms.tsx](C:/Users/vinci/Documents/Push2Cart/components/auth-forms.tsx); passwords are not stored manually in this codebase.
- Admin access is checked in [lib/admin.ts](C:/Users/vinci/Documents/Push2Cart/lib/admin.ts) and reinforced by Supabase RLS policies in [supabase/schema.sql](C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql).
- Public frontend code only uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; server-only secrets like `RESEND_API_KEY` stay in server routes.
- React rendering does not use `dangerouslySetInnerHTML`, which keeps obvious XSS risk low in the current UI.
- The biggest remaining risks are business-logic gaps: COD is the only payment flow.
- Validation and monitoring are stronger than before, but still lighter than a full production commerce stack.

### Improvements added in this review

- Checkout now runs through a single atomic database function so order creation, line-item insertion, stock deduction, voucher consumption, and cart clearing happen in one transaction.
- The order API now calculates totals from database prices inside the database function instead of trusting browser-submitted prices.
- Checkout now rejects invalid quantities, missing products, and quantities that exceed current stock before the order is finalized.
- Orders now store `payment_method` and `payment_status`, with COD defaulting to `Cash on Delivery` and `Pending`.
- Shared rate limiting now protects the checkout, reviews, reports, and game reward routes through [lib/rate-limit.ts](C:/Users/vinci/Documents/Push2Cart/lib/rate-limit.ts).
- The admin orders table now includes lightweight search and basic order statistics for cleaner day-to-day operations.
- Admins can now open a dedicated order details view with customer, delivery, payment, and line-item information.
- Order updates now leave a status activity trail, and the write APIs use tighter server-side input normalization and checks.
- Checkout now verifies that the posted cart matches the authenticated server-side cart, limits oversized orders, and blocks immediate duplicate submissions from the same account/address.
- The order lifecycle now follows a more practical operations flow with forward-only transitions and cancellation before shipment.
- Blocked checkout abuse attempts and invalid admin status transitions are now written to `security_events` for admin-side review.

### Deployment note

- Apply the updated [supabase/schema.sql](C:/Users/vinci/Documents/Push2Cart/supabase/schema.sql) in Supabase before relying on the new checkout flow.
- The schema update adds:
- `payment_method` and `payment_status` columns on `orders`
- `api_rate_limits` for request throttling
- `check_rate_limit(...)` for shared API protection
- `create_order_with_items(...)` for atomic order creation and stock deduction



