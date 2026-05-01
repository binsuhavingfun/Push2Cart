import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const steps: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
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
  const isCancelled = status === "Cancelled";
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
        <span
          className={cn(
            "px-3 py-2 text-xs uppercase tracking-[0.26em]",
            isCancelled
              ? "border border-primary/40 bg-primary/10 text-primary"
              : "border border-secondary/40 bg-secondary/10 text-secondary"
          )}
        >
          {status}
        </span>
      </div>
      {isCancelled ? (
        <div className="mb-6 border border-primary/30 bg-primary/10 px-4 py-4 text-sm text-white/85">
          This order was cancelled before delivery.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-6">
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
