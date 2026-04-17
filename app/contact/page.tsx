import { SectionHeading } from "@/components/section-heading";

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Contact"
        title="Need A Hand?"
        description="Questions about orders, vouchers, or checkout issues? Reach the Push2Cart crew through the support channels below."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Email", "vincetarogpaglicawan@gmail.com"],
          ["Phone", "+63 900 000 0000"],
          ["Hours", "Open daily, 9:00 AM - 6:00 PM (Philippine Time, GMT+8)"]
        ].map(([label, value]) => (
          <div key={label} className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-xs text-white">{label}</p>
            <p className="mt-3 text-white/75">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
