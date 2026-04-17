create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  image_url text not null,
  stock integer not null default 0 check (stock >= 0)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'Order Placed' check (
    status in ('Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered')
  ),
  total_price numeric(10, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  address text not null,
  phone text,
  full_name text
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  discount_percent integer not null check (discount_percent between 5 and 50),
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.game_plays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plays_today integer not null default 0 check (plays_today >= 0),
  last_play_date date
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  username text not null default 'User',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.vouchers enable row level security;
alter table public.game_plays enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public products are viewable by everyone" on public.products;
drop policy if exists "Users manage their own cart items" on public.cart_items;
drop policy if exists "Users view their own orders" on public.orders;
drop policy if exists "Users create their own orders" on public.orders;
drop policy if exists "Users update orders as admin" on public.orders;
drop policy if exists "Users view their own order items" on public.order_items;
drop policy if exists "Users create their own order items" on public.order_items;
drop policy if exists "Users manage their own vouchers" on public.vouchers;
drop policy if exists "Users manage their own game plays" on public.game_plays;
drop policy if exists "Anyone can view reviews" on public.reviews;
drop policy if exists "Authenticated users create reviews" on public.reviews;
drop policy if exists "Users read own admin row" on public.admin_users;

create policy "Public products are viewable by everyone"
on public.products
for select
to public
using (true);

create policy "Users manage their own cart items"
on public.cart_items
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users view their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update orders as admin"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Users view their own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users create their own order items"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users manage their own vouchers"
on public.vouchers
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users manage their own game plays"
on public.game_plays
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Anyone can view reviews"
on public.reviews
for select
to public
using (true);

create policy "Authenticated users create reviews"
on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users read own admin row"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

insert into public.products (id, name, description, price, image_url, stock)
values
  ('prod-boss-chair', 'Boss Chair', 'Comfortable seat designed for long gaming sessions.', 7999, '/images/boss-chair.svg', 10),
  ('prod-pixel-caps', 'Pixel Caps', 'Bright keycaps with a clean and solid feel.', 1299, '/images/pixel-caps.svg', 22),
  ('prod-turbo-pad', 'Turbo Pad', 'Fast and responsive controls for arcade-style play.', 1999, '/images/turbo-pad.svg', 14),
  ('prod-wave-headset', 'Wave Headset', 'Clear audio for gaming, music, and calls.', 2499, '/images/wave-headset.svg', 21),
  ('prod-echo-mic', 'Echo Mic', 'Clean voice capture for streaming and communication.', 1599, '/images/echo-mic.svg', 18),
  ('prod-glide-mouse', 'Glide Mouse', 'Smooth movement with steady control.', 1199, '/images/glide-mouse.svg', 35),
  ('prod-grid-pad', 'Grid Pad', 'Wide surface for better mouse precision.', 699, '/images/grid-pad.svg', 40),
  ('prod-pulse-keys', 'Pulse Keys', 'Responsive keys with quick input feedback.', 2799, '/images/pulse-keys.svg', 17),
  ('prod-beam-light', 'Beam Light', 'Soft lighting that reduces eye strain.', 999, '/images/beam-light.svg', 29),
  ('prod-chill-pad', 'Chill Pad', 'Keeps your device cool during extended use.', 1299, '/images/chill-pad.svg', 25),
  ('prod-mini-speakers', 'Mini Speakers', 'Compact speakers with clear sound output.', 1899, '/images/mini-speakers.svg', 16),
  ('prod-cable-box', 'Cable Box', 'Keeps cables organized and clutter-free.', 549, '/images/cable-box.svg', 50)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  stock = excluded.stock;
