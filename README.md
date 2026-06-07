# Push2Cart

Push2Cart is a retro pixel-art e-commerce student project built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.

Motto: `Play. Shop. Save.`

## Overview

Push2Cart mixes a simple storefront flow with a claw-machine reward loop. Guests can browse products and build a cart, customers can place demo orders and earn vouchers, and admins can manage products, orders, reviews, and reports.

The current homepage featured section uses:

> Shop featured picks.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth and Database
- Sentry (`@sentry/nextjs`)
- Vercel

## Current Features

- Homepage hero plus featured products section
- Responsive navbar with the `Play. Shop. Save.` tagline
- Guest cart with local storage and cart sync after login
- Email/password auth with forgot-password and reset-password flow
- Product listing and product detail pages
- Product reviews with 1 to 5 star ratings and comments
- Users can only review products they have purchased
- Checkout with Cash on Delivery, shipping validation, and voucher redemption
- Customer account page with profile overview, orders, purchase history, vouchers, and logout
- Order list and order detail pages with status timeline
- Customer order cancellation before shipment
- Daily claw machine mini-game with 2 plays per account per day
- Voucher rewards saved to the customer account
- Admin dashboard, order management, product management, review moderation, reports, and admin profile
- Public report form that sends email through Resend and stores reports in Supabase
- Supabase RLS policies plus server-side rate limiting, security-event logging, and role protections for orders, reports, vouchers, game plays, and admin-only data
- Optional Sentry wiring for client, server, edge, and global app errors

## Routes and Navigation

### Storefront Navbar

- Guest: core store links plus `Cart`, with `Login` as the far-right account action
- Customer: core store links plus `Cart`, with `Profile` as the far-right account action
- Admin: admin-focused navigation with `Dashboard`, `Orders`, `Reports`, `Profile`, and `Logout`

Notes:
- `Cart` is visible in the desktop and mobile navbar for both guests and customers.
- Admin product and review pages exist, but they are reached from admin pages rather than the top navbar.

### Footer

- Brand: `PUSH2CART`
- Links: `About`, `Report`, `Contact`, `Privacy Policy`, `Terms of Use`
- Footer note: Push2Cart is a student project and not affiliated with third-party brands shown in sample content.

### Main App Routes

- `/`
- `/products`
- `/products/[id]`
- `/cart`
- `/checkout`
- `/game`
- `/auth`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/callback`
- `/account`
- `/orders`
- `/orders/[id]`
- `/about`
- `/contact`
- `/report`
- `/privacy-policy`
- `/terms-of-use`

### Admin Routes

- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/reports`
- `/admin/reviews`
- `/admin/profile`

## Current User Flows

### Guest

- Browse products and product details
- Use a guest cart
- Log in when checkout or the mini-game requires an account

### Customer

- Sign up or log in through `/auth`
- Add products to cart and check out with Cash on Delivery
- Enter structured shipping details:
  - `full_name`
  - `phone_number`
  - `street_address`
  - `barangay`
  - `city`
  - `province`
  - `postal_code`
  - optional `delivery_notes`
- Use the customer cancel action only before an order reaches shipment
- Use available vouchers during checkout
- Track orders from `/orders` and `/orders/[id]`
- View account information, purchase history, vouchers, and logout on `/account`
- Play the claw machine and receive account-bound vouchers

### Admin

- Access the dashboard at `/admin`
- View and update order statuses
- Open a dedicated admin order detail page with customer, delivery, payment, item, and activity information
- Add and edit products
- Review incoming reports and feedback
- Moderate product reviews

## Auth and Password Recovery

- Auth page: `/auth`
- Forgot-password page: `/auth/forgot-password`
- Reset page: `/auth/reset-password`

The login form includes a `Forgot Password?` link. Reset emails should return directly to `/auth/reset-password`.

Deployment note:
- On Vercel, set `NEXT_PUBLIC_SITE_URL` to your deployed app URL.
- In Supabase Auth settings, keep your Site URL and allowed redirect URLs aligned with your Vercel domain, including `/auth/reset-password`.
- Old recovery emails remain tied to the URL that was generated when they were sent, so request a fresh reset email after changing auth URL settings.

## Cart, Checkout, Orders, and Vouchers

- Guests can use the cart before logging in.
- Logged-in customer carts are stored in Supabase.
- Checkout is customer-only. Admin accounts are blocked from customer checkout.
- Payment method is currently `Cash on Delivery`.
- Checkout applies shared validation for Philippine shipping fields and shows a delivery estimate based on region.
- `Province / Region` and `City / Municipality` stay flexible for non-NCR addresses.
- If the checkout address uses `Metro Manila`, `NCR`, or `National Capital Region`, `City / Municipality` switches to an NCR-only dropdown to reduce spelling mistakes.
- Postal code validation requires exactly 4 numeric digits.
- Available vouchers are fetched from `/api/vouchers` and can be applied during checkout.
- Orders are created through a server-side RPC flow that also inserts order items, deducts stock, marks a voucher as used, and clears the cart.
- Checkout rejects invalid quantities, oversized orders, cart mismatches, duplicate submissions, and admin-side misuse before an order is finalized.
- Customer order detail pages include a shipment timeline and allow cancellation before shipment.

## Product Reviews

- Customers can only review products they have purchased.
- Backend validation blocks review submissions unless the user has already ordered the product.
- Duplicate review attempts are rejected so each customer can leave one review per product.

## Claw Machine

- Route: `/game`
- Customer-only route
- 2 plays per account per day
- The claw sweeps left and right automatically
- The player chooses when to press `Drop Claw`
- Result handling includes a single server request per play, win/lose messaging, generated sound effects, and win-only confetti/reward reveal
- Rewards are stored as vouchers in Supabase
- If the request fails or takes too long, the UI shows a friendly error and resets cleanly instead of getting stuck mid-round
- The layout includes mobile-specific controls so the play area and action button stay usable on smaller screens

Capsule labels currently used in the game:
- `Yizz`
- `Nux`
- `Lucky`
- `GG`
- `67`
- `Sheesh`

## Reports and Feedback

- Public page: `/report`
- API route: `POST /api/reports`
- Report types:
  - `Bug Report`
  - `Website Feedback`
  - `Suggestion`
- Form fields:
  - optional name
  - optional email
  - report type
  - required message

Current behavior:
- The API rate-limits report submissions.
- Report payloads are validated for allowed report types, reasonable email format, and message length before email/send storage logic runs.
- The server sends report email through Resend.
- The server also stores the report in the `reports` table when Supabase is available.
- Admins can review submitted reports at `/admin/reports`.

Important:
- The report email feature requires `RESEND_API_KEY`.
- `REPORT_RECEIVER_EMAIL` is required so submitted reports have a delivery inbox.
- `REPORT_FROM_EMAIL` is optional and falls back to the Resend onboarding sender if omitted.

## Project Structure

```text
app/           App Router pages and API routes
components/    Reusable UI components
hooks/         Shared auth, cart, and UI hooks
lib/           Helpers, validation, products, Supabase clients, and role logic
public/        Static images and assets
scripts/       One-off maintenance scripts
supabase/      Schema and migrations
tests/         Vitest coverage
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from the example file:

```bash
Copy-Item .env.local.example .env.local
```

3. Fill in the required Supabase values in `.env.local`.

4. For a brand-new Supabase project, run [`supabase/schema.sql`](C:\Users\vinci\Documents\Push2Cart\supabase\schema.sql) in your Supabase SQL editor.

5. For an existing project, apply every SQL file in [`supabase/migrations`](C:\Users\vinci\Documents\Push2Cart\supabase\migrations) in order instead of re-running the full schema snapshot.

6. If you want an admin account, insert its auth user ID into `public.admin_users`.

Example:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_ID')
on conflict do nothing;
```

7. Start the dev server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Included in `.env.local.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
PRIVACY_CLEANUP_WHITELIST=demo-admin@example.com,demo-customer@example.com
PRIVACY_CLEANUP_ADMIN_EMAIL=demo-admin@example.com
```

### Additional variables used by the report email flow

These are used by the codebase but are not currently listed in `.env.local.example`:

```env
RESEND_API_KEY=
REPORT_RECEIVER_EMAIL=
REPORT_FROM_EMAIL=
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is required for the secure checkout RPC path and the privacy cleanup script.
- `REPORT_RECEIVER_EMAIL` is required if you want the public report form to work.
- `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` are optional unless you want Sentry enabled.
- `NEXT_PUBLIC_SITE_URL` should stay as `http://localhost:3000` for local development, but in Vercel it should be your deployed app origin so auth and password recovery links do not point back to localhost.
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are optional and are only needed if you want Sentry release/source-map upload during builds.
- `PRIVACY_CLEANUP_WHITELIST` and `PRIVACY_CLEANUP_ADMIN_EMAIL` are required if you want to run the privacy cleanup script without hardcoding real email addresses in the repo.
- To activate Sentry in both the browser and server runtimes, set both `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` to your project DSN in local and Vercel environment variables.
- `.env.local` is gitignored, so real DSN values should stay out of GitHub.

## Available Scripts

- `npm run dev` starts the local development server
- `npm run build` creates a production build
- `npm start` starts the production server after build
- `npm run typecheck` runs TypeScript checks
- `npm run test` runs the Vitest suite
- `npm run cleanup:privacy:dry-run` previews demo-account cleanup
- `npm run cleanup:privacy:execute` runs demo-account cleanup

## Supabase Notes

The schema currently defines and configures:

- `products`
- `cart_items`
- `orders`
- `order_items`
- `order_status_events`
- `vouchers`
- `game_plays`
- `reviews`
- `admin_users`
- `reports`
- `api_rate_limits`
- `security_events`

It also includes:

- seeded sample products
- RLS policies for public, customer, and admin access
- `check_rate_limit(...)` for shared server-side rate limiting
- `create_order_with_items(...)` for secure order creation

Security migration included in the repo:

- [`supabase/migrations/20260506_fix_security_advisor_warnings.sql`](C:\Users\vinci\Documents\Push2Cart\supabase\migrations\20260506_fix_security_advisor_warnings.sql) tightens report insert policies and restricts sensitive function execution to server-side roles
- [`supabase/migrations/20260516_sync_order_status_event_constraint.sql`](C:\Users\vinci\Documents\Push2Cart\supabase\migrations\20260516_sync_order_status_event_constraint.sql) repairs older `order_status_events` status constraints so checkout can write the current `Pending` event
- [`supabase/migrations/20260516_atomic_order_status_and_report_resilience.sql`](C:\Users\vinci\Documents\Push2Cart\supabase\migrations\20260516_atomic_order_status_and_report_resilience.sql) adds atomic order-status update functions and keeps app-side status rules aligned in the database

## Privacy Cleanup Script

Script: [`scripts/supabase-privacy-cleanup.mjs`](C:\Users\vinci\Documents\Push2Cart\scripts\supabase-privacy-cleanup.mjs)

What it does:
- keeps the configured demo whitelist
- validates that the required admin demo account still exists in `public.admin_users`
- supports dry-run mode by default
- deletes non-whitelisted auth users only when run with `--execute`
- clears related report and security rows that do not rely on cascade deletes

Required local env for this script:
- `PRIVACY_CLEANUP_WHITELIST`
- `PRIVACY_CLEANUP_ADMIN_EMAIL`

## Monitoring

Sentry files currently wired in this repo:

- [`instrumentation.ts`](C:\Users\vinci\Documents\Push2Cart\instrumentation.ts)
- [`instrumentation-client.ts`](C:\Users\vinci\Documents\Push2Cart\instrumentation-client.ts)
- [`sentry.server.config.ts`](C:\Users\vinci\Documents\Push2Cart\sentry.server.config.ts)
- [`sentry.edge.config.ts`](C:\Users\vinci\Documents\Push2Cart\sentry.edge.config.ts)
- [`app/global-error.tsx`](C:\Users\vinci\Documents\Push2Cart\app\global-error.tsx)

Current setup:
- `@sentry/nextjs` is installed in `package.json`.
- Client, server, edge, request-error, and global-error entry points are wired.
- Sentry stays disabled unless a DSN is provided.
- The app still runs normally in local development and production builds when Sentry env vars are empty.
- When DSN values are present, Sentry initializes through environment variables only. No DSN is hardcoded in the source.

## Verification

Run these before shipping:

```bash
npm run typecheck
npm run test
npm run build
```

## Possible Future Improvements

- If Push2Cart later needs online payments, decide whether Cash on Delivery is enough or whether a payment provider with webhook verification is needed.
- If Push2Cart is presented as a real store, add clearer policies for shipping, returns, refunds, privacy, and support expectations.
- If Push2Cart later supports real products at a larger scale, add stronger inventory and catalog management tools for admins.
- If Push2Cart stores important live data, set up regular backup and recovery steps.
