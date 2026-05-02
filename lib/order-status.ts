import type { OrderStatus } from "@/lib/types";

export const allowedOrderStatuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  "Pending": ["Confirmed", "Cancelled"],
  "Confirmed": ["Preparing", "Cancelled"],
  "Preparing": ["Shipped", "Cancelled"],
  "Shipped": ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  "Delivered": [],
  "Cancelled": []
};

export function isAllowedOrderStatus(value: string): value is OrderStatus {
  return allowedOrderStatuses.includes(value as OrderStatus);
}

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  if (current === next) {
    return true;
  }

  return (allowedOrderTransitions[current] ?? []).includes(next);
}

export function canCustomerCancelOrder(status: OrderStatus) {
  return status === "Pending" || status === "Confirmed" || status === "Preparing";
}
