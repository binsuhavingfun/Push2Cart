import { SectionHeading } from "@/components/section-heading";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionHeading
        eyebrow="Privacy"
        title="Privacy Policy"
      />

      <div className="pixel-border pixel-panel space-y-4 p-6 text-sm leading-7 text-white/75">
        <p>
          Push2Cart only uses the information needed to support account access, cart activity,
          checkout flow, rewards, and report submissions inside the project experience.
        </p>
        <p>
          Contact details shared through the site are used only for support, project feedback,
          or order-related communication. Push2Cart does not present itself as a commercial
          marketplace for third-party data use.
        </p>
        <p>
          If you have questions about your information or want help related to this project,
          please use the Contact page.
        </p>
      </div>
    </div>
  );
}
