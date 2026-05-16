-- Keep order status updates atomic and make report handling more resilient
-- by aligning database behavior with the application status rules.

create or replace function public.can_transition_order_status(
  p_current text,
  p_next text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_current = p_next then true
    when p_current = 'Pending' and p_next in ('Confirmed', 'Cancelled') then true
    when p_current = 'Confirmed' and p_next in ('Preparing', 'Cancelled') then true
    when p_current = 'Preparing' and p_next in ('Shipped', 'Cancelled') then true
    when p_current = 'Shipped' and p_next = 'Out for Delivery' then true
    when p_current = 'Out for Delivery' and p_next = 'Delivered' then true
    else false
  end;
$$;

create or replace function public.cancel_order_for_customer(
  p_order_id uuid
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_status text;
begin
  if v_user_id is null then
    raise exception 'Please log in.';
  end if;

  select public.orders.status into v_current_status
  from public.orders
  where public.orders.id = p_order_id
    and public.orders.user_id = v_user_id
  for update;

  if v_current_status is null then
    if exists (
      select 1
      from public.orders
      where public.orders.id = p_order_id
    ) then
      raise exception 'You can only manage your own orders.';
    end if;

    raise exception 'Order not found.';
  end if;

  if not public.can_transition_order_status(v_current_status, 'Cancelled') then
    raise exception 'This order can no longer be cancelled because it has already been shipped or completed.';
  end if;

  update public.orders
  set status = 'Cancelled'
  where public.orders.id = p_order_id;

  insert into public.order_status_events (order_id, status, note, actor_user_id)
  values (p_order_id, 'Cancelled', 'Cancelled by customer', v_user_id);

  return 'Cancelled';
end;
$$;

create or replace function public.update_order_status_as_admin(
  p_order_id uuid,
  p_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_status text;
begin
  if v_user_id is null then
    raise exception 'Please log in.';
  end if;

  if not exists (
    select 1
    from public.admin_users
    where public.admin_users.user_id = v_user_id
  ) then
    raise exception 'Admin access required.';
  end if;

  if p_status not in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled') then
    raise exception 'Invalid status value.';
  end if;

  select public.orders.status into v_current_status
  from public.orders
  where public.orders.id = p_order_id
  for update;

  if v_current_status is null then
    raise exception 'Order not found.';
  end if;

  if not public.can_transition_order_status(v_current_status, p_status) then
    raise exception 'Invalid status transition from % to %.', v_current_status, p_status;
  end if;

  if v_current_status = p_status then
    return p_status;
  end if;

  update public.orders
  set status = p_status
  where public.orders.id = p_order_id;

  insert into public.order_status_events (order_id, status, note, actor_user_id)
  values (p_order_id, p_status, 'Updated from admin dashboard', v_user_id);

  return p_status;
end;
$$;

revoke all on function public.can_transition_order_status(text, text) from public;
grant execute on function public.can_transition_order_status(text, text) to anon;
grant execute on function public.can_transition_order_status(text, text) to authenticated;

revoke all on function public.cancel_order_for_customer(uuid) from public;
revoke execute on function public.cancel_order_for_customer(uuid) from anon;
grant execute on function public.cancel_order_for_customer(uuid) to authenticated;

revoke all on function public.update_order_status_as_admin(uuid, text) from public;
revoke execute on function public.update_order_status_as_admin(uuid, text) from anon;
grant execute on function public.update_order_status_as_admin(uuid, text) to authenticated;
