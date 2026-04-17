# Push2Cart

Push2Cart is a retro pixel-art e-commerce app built with Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.

Motto: `Play. Shop. Save.`

Subtext: `Your cart just got more fun.`

## Features

- Homepage hero with pixel-art branding and dual CTAs
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



