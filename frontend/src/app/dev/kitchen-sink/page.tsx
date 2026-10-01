import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, Mail, Package, Search } from "lucide-react";

import { ContactDetail } from "@/components/marketing/contact-detail";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureCard } from "@/components/marketing/feature-card";
import { MediaSplit } from "@/components/marketing/media-split";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill, type Status } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { WashedImage } from "@/components/ui/washed-image";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

const RAMPS = {
  accent: [
    ["100", "bg-accent-100"],
    ["200", "bg-accent-200"],
    ["300", "bg-accent-300"],
    ["400", "bg-accent-400"],
    ["500", "bg-accent-500"],
    ["600", "bg-accent-600"],
    ["700", "bg-accent-700"],
    ["800", "bg-accent-800"],
    ["900", "bg-accent-900"],
  ],
  sage: [
    ["100", "bg-sage-100"],
    ["200", "bg-sage-200"],
    ["300", "bg-sage-300"],
    ["400", "bg-sage-400"],
    ["500", "bg-sage-500"],
    ["600", "bg-sage-600"],
    ["700", "bg-sage-700"],
    ["800", "bg-sage-800"],
    ["900", "bg-sage-900"],
  ],
} as const;
const STATUSES: Status[] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
  "CANCELLED",
  "ACTIVE",
  "DRAFT",
  "OUT_OF_STOCK",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6 border-t border-border pt-10">
      <h2 className="kicker text-accent-700">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Review surface for the design-system primitives (README Phase 0). Dev-only —
 * it 404s in production rather than shipping an unlinked public page.
 */
export default function KitchenSinkPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="shell space-y-12 py-section-y">
      <header className="space-y-3">
        <p className="kicker text-accent-700">Organic design system</p>
        <h1 className="font-display text-h1">Kitchen sink</h1>
        <p className="max-w-2xl text-muted">
          Every primitive on one page, so drift from the design is visible
          before it reaches a screen.
        </p>
      </header>

      <Section title="Type scale">
        <div className="space-y-4">
          <h2 className="font-display text-h1">Display H1 — Caprasimo 56px</h2>
          <h3 className="font-display text-h2">Display H2 — Caprasimo 32px</h3>
          <p className="kicker text-text">Kicker · uppercase · 0.22em</p>
          <p className="text-lg">Body large — Figtree 18px</p>
          <p className="text-[15px]">Body — Figtree 15px</p>
          <p className="text-sm text-muted">Muted small — Figtree 14px</p>
        </div>
      </Section>

      <Section title="Color ramps">
        <div className="space-y-6">
          {Object.entries(RAMPS).map(([role, steps]) => (
            <div key={role} className="space-y-2">
              <p className="text-sm font-semibold capitalize">{role}</p>
              <div className="flex overflow-hidden rounded-card">
                {steps.map(([step, cls]) => (
                  <div
                    key={step}
                    className={cn(
                      "flex h-20 flex-1 items-end justify-center pb-2 text-[11px] font-semibold",
                      cls,
                      Number(step) >= 500 ? "text-white" : "text-text",
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            {(
              [
                ["bg", "bg-bg"],
                ["surface", "bg-surface"],
                ["input", "bg-input"],
                ["text", "bg-text"],
              ] as const
            ).map(([name, cls]) => (
              <div key={name} className="space-y-2">
                <div
                  className={`size-24 rounded-card border border-border ${cls}`}
                />
                <p className="text-[13px] text-muted">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="quiet">Quiet</Button>
          <Button variant="sage">Sage</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="admin">Admin 44px</Button>
          <Button variant="quiet" size="icon" aria-label="Icon button">
            <Search size={20} strokeWidth={2.75} aria-hidden />
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-xl gap-6">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
          />
          <Input
            label="Full name"
            hint="As it should appear on the shipping label."
          />
          <Input
            label="Postal code"
            defaultValue="not-a-code"
            error="Enter a valid postal code."
          />
          <PasswordInput label="Password" placeholder="••••••••" />
          <PasswordInput
            label="Confirm password"
            defaultValue="mismatch"
            error="Passwords do not match."
          />
          <Textarea label="Message" placeholder="How can we help?" />
          <Textarea
            label="Message with error"
            rows={3}
            error="Write a message."
          />
        </div>
      </Section>

      <Section title="Section headings">
        <div className="space-y-10">
          <SectionHeading
            size="page"
            kicker="Size page · accent"
            title="Considered goods, chosen slowly."
          >
            <p>Lead paragraph, 18px, secondary text.</p>
          </SectionHeading>
          <SectionHeading
            align="center"
            tone="sage"
            kicker="Size section · sage · centered"
            title="Fewer things, made with more care."
          >
            <p>Lead paragraph, 16px.</p>
          </SectionHeading>
        </div>
      </Section>

      <Section title="Checkboxes">
        <div className="grid max-w-xl gap-4">
          <Checkbox label="Remember me" />
          <Checkbox label="Checked by default" defaultChecked />
          <Checkbox label="Disabled" disabled />
          <Checkbox
            label="I agree to the Terms of Service"
            error="You must accept the terms to continue."
          />
        </div>
      </Section>

      <Section title="Form alerts">
        <div className="grid max-w-xl gap-4">
          <FormAlert>Incorrect email or password.</FormAlert>
          <FormAlert>
            We couldn&apos;t reach the server. Check your connection and try
            again.
          </FormAlert>
        </div>
      </Section>

      <Section title="Status pills">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusPill key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section title="Content blocks">
        <div className="space-y-12">
          <MediaSplit
            image={{ alt: "Media split sample", className: "aspect-4/3" }}
          >
            <SectionHeading
              kicker="Media split"
              title="Copy first, image second"
            >
              <p>Stacks below lg; mediaFirst puts the image left above it.</p>
            </SectionHeading>
          </MediaSplit>

          <div className="grid gap-5 lg:grid-cols-2">
            <FeatureCard icon={Package} title="Feature card · accent">
              Icon, display title and a short muted paragraph.
            </FeatureCard>
            <FeatureCard icon={Heart} tone="sage" title="Feature card · sage">
              Same card with the second voice.
            </FeatureCard>
          </div>

          <dl className="space-y-6">
            <ContactDetail icon={Mail} label="Contact detail">
              Icon, label and value — render inside a dl.
            </ContactDetail>
          </dl>

          <CtaBand
            title="CTA band"
            actions={
              <Link href="#" className={buttonClasses()}>
                Primary action
              </Link>
            }
          >
            Terracotta radial panel that closes a content page.
          </CtaBand>
        </div>
      </Section>

      <Section title="Cards & imagery">
        <div className="grid gap-gutter md:grid-cols-3">
          <Card>
            <WashedImage alt="Placeholder product" className="h-56" />
            <CardBody className="space-y-1">
              <CardTitle>Card — storefront</CardTitle>
              <p className="text-sm text-muted">24px radius, deep shadow</p>
            </CardBody>
          </Card>

          <Card elevation="panel">
            <CardBody className="space-y-1">
              <CardTitle>Panel — admin</CardTitle>
              <p className="text-sm text-muted">28px radius, flat shadow</p>
            </CardBody>
          </Card>

          <WashedImage
            alt="Scrim treatment sample"
            scrim
            className="h-full min-h-56 rounded-card"
          >
            <div className="flex h-full items-end p-6">
              <p className="font-display text-xl text-white">Scrim + washed</p>
            </div>
          </WashedImage>
        </div>
      </Section>
    </div>
  );
}
