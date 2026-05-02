import { describe, expect, it } from "vitest";
import {
  allowedOrderStatuses,
  canCustomerCancelOrder,
  canTransitionOrderStatus,
  isAllowedOrderStatus
} from "@/lib/order-status";

describe("order status rules", () => {
  it("exposes the supported admin order statuses", () => {
    expect(allowedOrderStatuses).toEqual([
      "Pending",
      "Confirmed",
      "Preparing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled"
    ]);
  });

  it("accepts only supported status labels", () => {
    expect(isAllowedOrderStatus("Pending")).toBe(true);
    expect(isAllowedOrderStatus("Refunded")).toBe(false);
  });

  it("allows only forward admin order transitions", () => {
    expect(canTransitionOrderStatus("Pending", "Confirmed")).toBe(true);
    expect(canTransitionOrderStatus("Preparing", "Shipped")).toBe(true);
    expect(canTransitionOrderStatus("Shipped", "Delivered")).toBe(false);
    expect(canTransitionOrderStatus("Delivered", "Cancelled")).toBe(false);
  });

  it("lets customers cancel only before shipment", () => {
    expect(canCustomerCancelOrder("Pending")).toBe(true);
    expect(canCustomerCancelOrder("Confirmed")).toBe(true);
    expect(canCustomerCancelOrder("Preparing")).toBe(true);
    expect(canCustomerCancelOrder("Shipped")).toBe(false);
    expect(canCustomerCancelOrder("Out for Delivery")).toBe(false);
    expect(canCustomerCancelOrder("Delivered")).toBe(false);
    expect(canCustomerCancelOrder("Cancelled")).toBe(false);
  });
});
