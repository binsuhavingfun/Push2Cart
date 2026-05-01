import Link from "next/link";
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
          { label: "Email", value: "vincetarogpaglicawan@gmail.com" },
          {
            label: "GitHub",
            value: "https://github.com/binsuhavingfun",
            href: "https://github.com/binsuhavingfun"
          },
          { label: "Hours", value: "Open daily, 9:00 AM - 6:00 PM (Philippine Time, GMT+8)" }
        ].map(({ label, value, href }) => (
          <div key={label} className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-xs text-white">{label}</p>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-white/75 hover:text-white"
              >
                {value}
              </a>
            ) : (
              <p className="mt-3 text-white/75">{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="pixel-border pixel-panel max-w-3xl p-6">
        <p className="pixel-heading text-xs text-white">Report an Issue</p>
        <p className="mt-3 text-white/75">
          Found a bug or want to send website feedback? Use our report form so the team can review
          your concern quickly.
        </p>
        <Link href="/report" className="pixel-border mt-5 inline-block px-4 py-2 text-xs text-white">
          Open Report Form
        </Link>
      </div>
    </div>
  );
}
