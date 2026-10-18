import { PolicyPage } from "@/components/marketing/policy-page";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Terms of service",
};

export default function TermsPage() {
  return (
    <PolicyPage
      draft
      kicker="Legal"
      title="Terms of service"
      updated="August 1, 2026"
      intro={
        <p>
          These terms govern your use of the {SITE.name} website and any
          purchase made through it. By placing an order, creating an account, or
          browsing the site, you agree to the terms below.
        </p>
      }
      sections={[
        {
          title: "Orders & payment",
          body: (
            <p>
              All prices are listed in Bangladeshi taka (৳) and are subject to
              change without notice. We reserve the right to refuse or cancel
              any order, including for suspected fraud or pricing errors, in
              which case any payment taken will be refunded in full.
            </p>
          ),
        },
        {
          title: "Product information",
          body: (
            <p>
              We describe materials, dimensions and care instructions as
              accurately as possible. Because many items are handmade or
              naturally sourced, slight variation in colour, texture and pattern
              between pieces should be expected and is not a defect.
            </p>
          ),
        },
        {
          title: "Accounts",
          body: (
            <p>
              You&rsquo;re responsible for keeping your account credentials
              confidential and for all activity under your account. Let us know
              right away if you suspect unauthorised access.
            </p>
          ),
        },
        {
          title: "Intellectual property",
          body: (
            <p>
              All photography, copy and design on this site belong to{" "}
              {SITE.name} or its licensors and may not be reproduced without
              written permission.
            </p>
          ),
        },
        {
          title: "Limitation of liability",
          body: (
            <p>
              {SITE.name} is not liable for indirect or incidental damages
              arising from use of the site or products beyond the purchase price
              paid.
            </p>
          ),
        },
        {
          title: "Contact",
          body: (
            <p>
              Questions about these terms can be sent to{" "}
              <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
