import { PolicyPage } from "@/components/marketing/policy-page";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "Privacy policy",
};

export default function PrivacyPage() {
  const email = <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>;

  return (
    <PolicyPage
      draft
      kicker="Legal"
      title="Privacy policy"
      updated="August 1, 2026"
      intro={
        <p>
          This policy explains what information {SITE.name} collects, how
          it&rsquo;s used, and the choices you have.
        </p>
      }
      sections={[
        {
          title: "Information we collect",
          body: (
            <p>
              When you create an account, place an order or contact us, we
              collect the information you provide — name, email, shipping
              address and order details. Payments are handled by our payment
              provider; we never see or store card numbers. We also collect
              basic usage data, like pages visited, to improve the site.
            </p>
          ),
        },
        {
          title: "How we use it",
          body: (
            <p>
              Your information is used to fulfil and ship orders, provide
              customer support, and — only if you sign up — send occasional
              emails about new arrivals. We do not sell your personal
              information to third parties.
            </p>
          ),
        },
        {
          title: "Cookies",
          body: (
            <p>
              We use cookies to keep you signed in and to remember your cart.
              You can disable cookies in your browser, though signing in and the
              cart will then stop working.
            </p>
          ),
        },
        {
          title: "Your choices",
          body: (
            <p>
              You can review or update your information anytime from your
              account, unsubscribe from marketing email at any time, and ask us
              to delete your account and its data by contacting us.
            </p>
          ),
        },
        {
          title: "Contact",
          body: <p>Questions about this policy can be sent to {email}.</p>,
        },
      ]}
    />
  );
}
