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
  status text not null default 'Pending' check (
    status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')
  ),
  total_price numeric(10, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  address text not null,
  email text,
  phone text,
  payment_method text not null default 'Cash on Delivery',
  payment_status text not null default 'Pending',
  full_name text,
  phone_number text,
  street_address text,
  barangay text,
  city text,
  province text,
  postal_code text,
  delivery_notes text
);

alter table public.orders add column if not exists phone_number text;
alter table public.orders add column if not exists street_address text;
alter table public.orders add column if not exists barangay text;
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists province text;
alter table public.orders add column if not exists postal_code text;
alter table public.orders add column if not exists delivery_notes text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists payment_method text not null default 'Cash on Delivery';
alter table public.orders add column if not exists payment_status text not null default 'Pending';

do $$
begin
  alter table public.orders drop constraint if exists orders_status_check;
  alter table public.orders
    add constraint orders_status_check
    check (status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

  alter table public.order_status_events drop constraint if exists order_status_events_status_check;
  alter table public.order_status_events
    add constraint order_status_events_status_check
    check (status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_method_check'
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('Cash on Delivery'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded'));
  end if;
end $$;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (
    status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')
  ),
  note text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
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

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  report_type text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  identifier text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, identifier, window_start)
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null default 'warning' check (severity in ('info', 'warning')),
  user_id uuid references auth.users(id) on delete set null,
  request_identifier text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.reports add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists name text;
alter table public.reports add column if not exists email text;
alter table public.reports add column if not exists report_type text;
alter table public.reports add column if not exists message text;
alter table public.reports add column if not exists created_at timestamptz not null default now();

alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.vouchers enable row level security;
alter table public.game_plays enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_users enable row level security;
alter table public.reports enable row level security;
alter table public.api_rate_limits enable row level security;
alter table public.security_events enable row level security;

drop policy if exists "Public products are viewable by everyone" on public.products;
drop policy if exists "Admins create products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;
drop policy if exists "Users manage their own cart items" on public.cart_items;
drop policy if exists "Users view their own orders" on public.orders;
drop policy if exists "Users create their own orders" on public.orders;
drop policy if exists "Users update orders as admin" on public.orders;
drop policy if exists "Users view their own order items" on public.order_items;
drop policy if exists "Users create their own order items" on public.order_items;
drop policy if exists "Users view their own order status events" on public.order_status_events;
drop policy if exists "Admins can view all order status events" on public.order_status_events;
drop policy if exists "Admins can create order status events" on public.order_status_events;
drop policy if exists "Users manage their own vouchers" on public.vouchers;
drop policy if exists "Users manage their own game plays" on public.game_plays;
drop policy if exists "Anyone can view reviews" on public.reviews;
drop policy if exists "Authenticated users create reviews" on public.reviews;
drop policy if exists "Admins delete reviews" on public.reviews;
drop policy if exists "Users read own admin row" on public.admin_users;
drop policy if exists "Anyone can submit reports" on public.reports;
drop policy if exists "Anonymous users can submit validated reports" on public.reports;
drop policy if exists "Signed-in users can submit validated reports" on public.reports;
drop policy if exists "Admins can read reports" on public.reports;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can view all order items" on public.order_items;
drop policy if exists "Admins can read security events" on public.security_events;

create policy "Public products are viewable by everyone"
on public.products
for select
to public
using (true);

create policy "Admins create products"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins update products"
on public.products
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

create policy "Admins delete products"
on public.products
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

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

create policy "Admins can view all orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

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

create policy "Admins can view all order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
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

create policy "Admins delete reviews"
on public.reviews
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Users read own admin row"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

create policy "Anonymous users can submit validated reports"
on public.reports
for insert
to anon
with check (
  user_id is null
  and report_type in ('Bug Report', 'Website Feedback', 'Suggestion')
  and char_length(trim(message)) between 1 and 1200
  and (
    name is null
    or char_length(trim(name)) between 1 and 120
  )
  and (
    email is null
    or (
      char_length(trim(email)) between 3 and 160
      and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  )
);

create policy "Signed-in users can submit validated reports"
on public.reports
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and report_type in ('Bug Report', 'Website Feedback', 'Suggestion')
  and char_length(trim(message)) between 1 and 1200
  and (
    name is null
    or char_length(trim(name)) between 1 and 120
  )
  and (
    email is null
    or (
      char_length(trim(email)) between 3 and 160
      and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  )
);

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

create policy "Admins can read security events"
on public.security_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Users view their own order status events"
on public.order_status_events
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_status_events.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Admins can view all order status events"
on public.order_status_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can create order status events"
on public.order_status_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create or replace function public.check_rate_limit(
  p_scope text,
  p_identifier text,
  p_max_requests integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window_seconds integer := greatest(coalesce(p_window_seconds, 60), 1);
  v_max_requests integer := greatest(coalesce(p_max_requests, 1), 1);
  v_window_start timestamptz;
  v_request_count integer;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Only server-side roles may execute check_rate_limit.';
  end if;

  if coalesce(trim(p_scope), '') = '' or coalesce(trim(p_identifier), '') = '' then
    raise exception 'Rate limit scope and identifier are required.';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
  );

  insert into public.api_rate_limits (scope, identifier, window_start, request_count, updated_at)
  values (trim(p_scope), trim(p_identifier), v_window_start, 1, now())
  on conflict (scope, identifier, window_start)
  do update
    set request_count = public.api_rate_limits.request_count + 1,
        updated_at = now()
  returning request_count into v_request_count;

  return jsonb_build_object(
    'allowed', v_request_count <= v_max_requests,
    'count', v_request_count,
    'remaining', greatest(v_max_requests - v_request_count, 0),
    'reset_at', v_window_start + make_interval(secs => v_window_seconds)
  );
end;
$$;

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone_number text,
  p_street_address text,
  p_barangay text,
  p_city text,
  p_province text,
  p_postal_code text,
  p_delivery_notes text,
  p_address text,
  p_payment_method text,
  p_voucher_id uuid,
  p_items jsonb
)
returns table (
  order_id uuid,
  total_price numeric,
  payment_status text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request_user_id uuid := auth.uid();
  v_item_count integer;
  v_product_count integer;
  v_subtotal numeric(10, 2);
  v_discount_percent integer := 0;
  v_final_total numeric(10, 2);
  v_order_id uuid;
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    if v_request_user_id is null or v_request_user_id <> p_user_id then
      raise exception 'You are not authorized to create this order.';
    end if;
  end if;

  if p_user_id is null then
    raise exception 'A valid user is required to create an order.';
  end if;

  if exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = p_user_id
  ) then
    raise exception 'Admin accounts cannot place customer orders.';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Order items must be sent as an array.';
  end if;

  if p_payment_method <> 'Cash on Delivery' then
    raise exception 'Unsupported payment method.';
  end if;

  create temporary table if not exists pg_temp.checkout_items (
    product_id text primary key,
    quantity integer not null check (quantity > 0)
  ) on commit drop;

  truncate pg_temp.checkout_items;

  insert into pg_temp.checkout_items (product_id, quantity)
  select
    trim(item->>'product_id') as product_id,
    sum((item->>'quantity')::integer) as quantity
  from jsonb_array_elements(p_items) as item
  where coalesce(trim(item->>'product_id'), '') <> ''
    and coalesce(item->>'quantity', '') ~ '^\d+$'
  group by trim(item->>'product_id');

  select count(*) into v_item_count
  from pg_temp.checkout_items;

  if coalesce(v_item_count, 0) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  perform 1
  from public.products p
  join pg_temp.checkout_items i on i.product_id = p.id
  for update of p;

  select count(*) into v_product_count
  from pg_temp.checkout_items i
  join public.products p on p.id = i.product_id;

  if v_product_count <> v_item_count then
    raise exception 'One or more products in your cart are no longer available.';
  end if;

  if exists (
    select 1
    from public.products p
    join pg_temp.checkout_items i on i.product_id = p.id
    where p.stock < i.quantity
  ) then
    raise exception 'Some items in your cart exceed available stock.';
  end if;

  select coalesce(sum(p.price * i.quantity), 0)::numeric(10, 2) into v_subtotal
  from public.products p
  join pg_temp.checkout_items i on i.product_id = p.id;

  if p_voucher_id is not null then
    select discount_percent into v_discount_percent
    from public.vouchers
    where id = p_voucher_id
      and user_id = p_user_id
      and is_used = false;

    if v_discount_percent is null then
      raise exception 'Selected voucher is not available.';
    end if;
  end if;

  v_final_total := greatest(v_subtotal - (v_subtotal * (v_discount_percent / 100.0)), 0)::numeric(10, 2);

  insert into public.orders (
    user_id,
    status,
    total_price,
    address,
    email,
    phone,
    payment_method,
    payment_status,
    full_name,
    phone_number,
    street_address,
    barangay,
    city,
    province,
    postal_code,
    delivery_notes
  )
  values (
    p_user_id,
    'Pending',
    v_final_total,
    p_address,
    nullif(trim(coalesce(p_email, '')), ''),
    p_phone_number,
    p_payment_method,
    'Pending',
    p_full_name,
    p_phone_number,
    p_street_address,
    p_barangay,
    p_city,
    p_province,
    p_postal_code,
    nullif(p_delivery_notes, '')
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity, price)
  select
    v_order_id,
    p.id,
    i.quantity,
    p.price
  from pg_temp.checkout_items i
  join public.products p on p.id = i.product_id;

  insert into public.order_status_events (order_id, status, note, actor_user_id)
  values (v_order_id, 'Pending', 'Order created at checkout', p_user_id);

  update public.products p
  set stock = p.stock - i.quantity
  from pg_temp.checkout_items i
  where p.id = i.product_id;

  if p_voucher_id is not null then
    update public.vouchers
    set is_used = true
    where id = p_voucher_id
      and user_id = p_user_id
      and is_used = false;
  end if;

  delete from public.cart_items
  where user_id = p_user_id;

  return query
  select v_order_id, v_final_total, 'Pending'::text;
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer) from public;
revoke execute on function public.check_rate_limit(text, text, integer, integer) from anon;
revoke execute on function public.check_rate_limit(text, text, integer, integer) from authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

revoke all on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from public;
revoke execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from anon;
revoke execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from authenticated;
grant execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) to service_role;

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
