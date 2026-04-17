import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const steps: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

export function OrderStatusTimeline({
  status,
  region
}: {
  status: OrderStatus;
  region: "Metro" | "Provincial";
}) {
  const activeIndex = steps.findIndex((step) => step === status);

  return (
    <div className="pixel-border pixel-panel p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="pixel-heading text-xs text-white">Order Tracking</p>
          <p className="mt-2 text-sm text-white/70">
            Estimated delivery: {region === "Metro" ? "2-4 days" : "4-7 days"} (
            {region === "Metro" ? "Metro Manila" : "Provincial"})
          </p>
        </div>
        <span className="border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs uppercase tracking-[0.26em] text-secondary">
          {status}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step} className="relative">
            <div
              className={cn(
                "border px-3 py-4 text-center text-xs uppercase tracking-[0.18em]",
                index <= activeIndex
                  ? "border-primary bg-primary/15 text-white"
                  : "border-white/10 bg-background/40 text-white/45"
              )}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
