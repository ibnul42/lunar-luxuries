import Link from "next/link";

import { Accordion, AccordionItem } from "@/components/ui/accordion";

export const metadata = {
  title: "FAQ",
  description:
    "Shipping, returns, tracking and materials — answers to common questions.",
};

/**
 * Copy from the FAQ design, adjusted where it described things this store
 * doesn't do yet (expedited checkout options, emailed tracking links).
 * README §7 still lists the real FAQ copy as outstanding.
 */
const FAQS = [
  {
    q: "How long does shipping take?",
    a: "Orders ship within 2 business days. Standard delivery then takes 3–7 business days depending on where you are.",
  },
  {
    q: "What is your return policy?",
    a: (
      <>
        Unused items in original packaging can be returned within 30 days of
        delivery for a full refund. See{" "}
        <Link href="/shipping-returns">Shipping &amp; Returns</Link> for the
        details, or <Link href="/contact">contact us</Link> to start one.
      </>
    ),
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. International delivery is priced by destination and typically takes 7–14 business days.",
  },
  {
    q: "How do I track my order?",
    a: (
      <>
        Signed in, every order and its status is under{" "}
        <Link href="/account?tab=orders">Orders</Link> in your account. Without
        an account, use <Link href="/orders/track">Track an order</Link> with
        your order number and email.
      </>
    ),
  },
  {
    q: "Are your materials sustainably sourced?",
    a: "We work with a small, visited roster of studios and makers who favour natural materials and finishes that age well. Each product page lists its materials and origin.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Orders can be changed or cancelled within 2 hours of placing them — contact us right away and we'll do our best to catch it before it ships.",
  },
] as const;

export default function FaqPage() {
  return (
    <div className="shell max-w-3xl pt-10 pb-section-y-sm lg:pt-14 lg:pb-section-y-lg">
      <p className="mb-3 kicker text-accent-700">Help center</p>
      <h1 className="mb-10 font-display text-[34px] leading-tight sm:text-title">
        Frequently asked questions
      </h1>

      <Accordion className="[&_a]:font-semibold [&_a]:text-accent-700 [&_a:hover]:text-accent-800">
        {FAQS.map((faq, index) => (
          <AccordionItem
            key={faq.q}
            title={faq.q}
            name="faq"
            defaultOpen={index === 0}
          >
            {faq.a}
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-10 text-[15px] text-muted">
        Still have questions?{" "}
        <Link
          href="/contact"
          className="font-semibold text-accent-700 hover:text-accent-800"
        >
          Get in touch
        </Link>{" "}
        and we&rsquo;ll help directly.
      </p>
    </div>
  );
}
