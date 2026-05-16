-- Align the order status event constraint with the application status labels.
-- Existing projects may still have an older check constraint that rejects
-- the current "Pending" status written during checkout.

do $$
begin
  alter table public.order_status_events drop constraint if exists order_status_events_status_check;
  alter table public.order_status_events
    add constraint order_status_events_status_check
    check (status in ('Pending', 'Confirmed', 'Preparing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));
end $$;
