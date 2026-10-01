import { Clock, Mail, Phone, Store } from "lucide-react";

import { ContactDetail } from "@/components/marketing/contact-detail";
import { Card, CardBody } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { WashedImage } from "@/components/ui/washed-image";
import { SITE } from "@/lib/site";

import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact",
  description: `Questions about an order, wholesale or press — write to ${SITE.name} and we'll reply within one business day.`,
};

const LINK = "font-semibold text-accent-700 hover:text-accent-800";

export default function ContactPage() {
  const { studio } = SITE;

  return (
    <>
      <section className="shell pt-10 lg:pt-16">
        <SectionHeading
          as="h1"
          size="page"
          align="center"
          kicker="Get in touch"
          title="We'd love to hear from you."
        >
          <p>
            Questions about an order, a wholesale inquiry, or just want to say
            hello — the team reads every message and replies within one business
            day.
          </p>
        </SectionHeading>
      </section>

      <section className="shell grid gap-10 py-section-y-sm lg:grid-cols-[11fr_9fr] lg:gap-14 lg:py-section-y">
        <Card className="self-start">
          <CardBody className="p-6 sm:p-10">
            <h2 className="mb-7 font-display text-2xl text-text">
              Send a message
            </h2>
            <ContactForm />
          </CardBody>
        </Card>

        {/* Side by side on tablets, where a full-width 4:3 photo would push
            the details a screen below the form. */}
        <div className="grid content-start gap-8 md:grid-cols-2 md:items-center lg:grid-cols-1">
          <WashedImage
            alt="The Lunar Luxuries studio and showroom"
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
            className="aspect-4/3 rounded-card shadow-card"
          />

          <dl className="space-y-6">
            <ContactDetail icon={Store} label="Studio & showroom">
              <address className="not-italic">
                {studio.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </ContactDetail>
            <ContactDetail icon={Mail} label="Email">
              <a href={`mailto:${SITE.supportEmail}`} className={LINK}>
                {SITE.supportEmail}
              </a>
            </ContactDetail>
            <ContactDetail icon={Phone} label="Phone">
              <a href={`tel:${studio.phoneHref}`} className={LINK}>
                {studio.phone}
              </a>
            </ContactDetail>
            <ContactDetail icon={Clock} label="Hours">
              {studio.hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </ContactDetail>
          </dl>
        </div>
      </section>
    </>
  );
}
