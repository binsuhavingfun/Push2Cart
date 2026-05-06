-- Fix Supabase Security Advisor warnings without weakening application security.
-- This migration:
-- 1. Replaces the overly-permissive reports insert policy.
-- 2. Restricts function execution to server-side service_role only.
-- 3. Converts the flagged functions to SECURITY INVOKER and adds explicit guards.

alter table public.reports enable row level security;

drop policy if exists "Anyone can submit reports" on public.reports;
drop policy if exists "Anonymous users can submit validated reports" on public.reports;
drop policy if exists "Signed-in users can submit validated reports" on public.reports;

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

revoke execute on function public.check_rate_limit(text, text, integer, integer) from public;
revoke execute on function public.check_rate_limit(text, text, integer, integer) from anon;
revoke execute on function public.check_rate_limit(text, text, integer, integer) from authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

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

  create temporary table if not exists checkout_items (
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
  from public.products as p
  join pg_temp.checkout_items as i on i.product_id = p.id
  for update of p;

  select count(*) into v_product_count
  from pg_temp.checkout_items as i
  join public.products as p on p.id = i.product_id;

  if v_product_count <> v_item_count then
    raise exception 'One or more products in your cart are no longer available.';
  end if;

  if exists (
    select 1
    from public.products as p
    join pg_temp.checkout_items as i on i.product_id = p.id
    where p.stock < i.quantity
  ) then
    raise exception 'Some items in your cart exceed available stock.';
  end if;

  select coalesce(sum(p.price * i.quantity), 0)::numeric(10, 2) into v_subtotal
  from public.products as p
  join pg_temp.checkout_items as i on i.product_id = p.id;

  if p_voucher_id is not null then
    select public.vouchers.discount_percent into v_discount_percent
    from public.vouchers
    where public.vouchers.id = p_voucher_id
      and public.vouchers.user_id = p_user_id
      and public.vouchers.is_used = false;

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
  returning public.orders.id into v_order_id;

  insert into public.order_items (order_id, product_id, quantity, price)
  select
    v_order_id,
    p.id,
    i.quantity,
    p.price
  from pg_temp.checkout_items as i
  join public.products as p on p.id = i.product_id;

  insert into public.order_status_events (order_id, status, note, actor_user_id)
  values (v_order_id, 'Pending', 'Order created at checkout', p_user_id);

  update public.products as p
  set stock = p.stock - i.quantity
  from pg_temp.checkout_items as i
  where p.id = i.product_id;

  if p_voucher_id is not null then
    update public.vouchers
    set is_used = true
    where public.vouchers.id = p_voucher_id
      and public.vouchers.user_id = p_user_id
      and public.vouchers.is_used = false;
  end if;

  delete from public.cart_items
  where public.cart_items.user_id = p_user_id;

  return query
  select v_order_id, v_final_total, 'Pending'::text;
end;
$$;

revoke execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from public;
revoke execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from anon;
revoke execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) from authenticated;
grant execute on function public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb) to service_role;

-- Verification queries:
-- 1. Confirm reports still use RLS:
-- select relrowsecurity
-- from pg_class
-- join pg_namespace on pg_namespace.oid = pg_class.relnamespace
-- where pg_namespace.nspname = 'public' and pg_class.relname = 'reports';
--
-- 2. Confirm no reports policy uses always-true expressions:
-- select polname,
--        pg_get_expr(polqual, polrelid) as using_expression,
--        pg_get_expr(polwithcheck, polrelid) as with_check_expression
-- from pg_policy
-- join pg_class on pg_class.oid = pg_policy.polrelid
-- join pg_namespace on pg_namespace.oid = pg_class.relnamespace
-- where pg_namespace.nspname = 'public' and pg_class.relname = 'reports';
--
-- 3. Confirm function execute grants are locked down:
-- select
--   has_function_privilege('anon', 'public.check_rate_limit(text, text, integer, integer)', 'EXECUTE') as anon_check_rate_limit,
--   has_function_privilege('authenticated', 'public.check_rate_limit(text, text, integer, integer)', 'EXECUTE') as authenticated_check_rate_limit,
--   has_function_privilege('service_role', 'public.check_rate_limit(text, text, integer, integer)', 'EXECUTE') as service_check_rate_limit,
--   has_function_privilege('anon', 'public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb)', 'EXECUTE') as anon_create_order,
--   has_function_privilege('authenticated', 'public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb)', 'EXECUTE') as authenticated_create_order,
--   has_function_privilege('service_role', 'public.create_order_with_items(uuid, text, text, text, text, text, text, text, text, text, text, text, uuid, jsonb)', 'EXECUTE') as service_create_order;
--
-- 4. Confirm create_order_with_items rejects non-server callers without matching auth.uid():
-- begin;
-- set local role authenticated;
-- select public.create_order_with_items(
--   '00000000-0000-0000-0000-000000000000',
--   null, null, null, null, null, null, null, null, null, null, 'Cash on Delivery', null, '[]'::jsonb
-- );
-- rollback;
