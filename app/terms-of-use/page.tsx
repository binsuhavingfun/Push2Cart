import { SectionHeading } from "@/components/section-heading";

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SectionHeading
        eyebrow="Terms"
        title="Terms of Use"
        description="Review the basic terms for using Push2Cart."
      />

      <div className="pixel-border pixel-panel space-y-4 p-6 text-sm leading-7 text-white/75">
        <p>
          Push2Cart is a student project built for demonstration, learning, and portfolio use.
          Any sample products, rewards, and branded references are presented for project context.
        </p>
        <p>
          Please use the site respectfully, avoid misuse of forms or account features, and do not
          treat sample content as an official third-party partnership or storefront promise.
        </p>
        <p>
          Project content and flows may change over time as the site is refined and improved.
        </p>
      </div>
    </div>
  );
}
