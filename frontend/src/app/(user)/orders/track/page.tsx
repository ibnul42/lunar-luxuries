import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";

import { TrackOrder } from "./track-order";

export const metadata = {
  title: "Track an order",
  description: "Look up an order's status with its number and email.",
};

export default function TrackOrderPage() {
  return (
    <div className="shell max-w-5xl pt-10 pb-section-y-sm lg:pt-14 lg:pb-section-y-lg">
      <SectionHeading
        as="h1"
        size="page"
        kicker="Order tracking"
        title="Where's my order?"
        align="center"
        className="mb-10"
      >
        <p>
          Enter your order number and the email you used at checkout. Signed in?
          Your orders are all in{" "}
          <Link
            href="/account?tab=orders"
            className="font-semibold text-accent-700 hover:text-accent-800"
          >
            your account
          </Link>
          .
        </p>
      </SectionHeading>
      <TrackOrder />
    </div>
  );
}
