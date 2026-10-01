import Link from "next/link";
import { Clock, Heart, Package } from "lucide-react";

import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureCard } from "@/components/marketing/feature-card";
import { MediaSplit } from "@/components/marketing/media-split";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `How ${SITE.name} chooses what it sells — fewer things, made and sourced with more care.`,
};

// Copy is the design's draft; README §7 lists real About copy as still needed.
const VALUES = [
  {
    icon: Package,
    tone: "accent",
    title: "Made to last",
    body: "Solid materials over trend cycles. If it won't hold up in ten years, it doesn't make the shelf.",
  },
  {
    icon: Clock,
    tone: "sage",
    title: "Sourced slowly",
    body: "We work with a small, visited roster of studios and makers — never a drop-ship catalog.",
  },
  {
    icon: Heart,
    tone: "accent",
    title: "Kept honest",
    body: "Real prices, real materials listed, no manufactured urgency. What you see is what it is.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="shell pt-10 pb-section-y-sm lg:pt-16 lg:pb-section-y">
        <MediaSplit
          priority
          image={{
            alt: "The Lunar Luxuries studio and its founders",
            className: "aspect-4/3 lg:aspect-square",
          }}
        >
          <SectionHeading
            as="h1"
            size="page"
            kicker="Our story"
            title="Considered goods, chosen slowly."
          >
            {/* The design's "Nine years later" was already wrong in 2026, so
                the sentence no longer counts years. */}
            <p>
              {SITE.name} started in {SITE.foundedYear} as a single shelf of
              hand-picked jewelry and home pieces. We still choose every item
              the same way — for how it feels to live with, not how it
              photographs.
            </p>
          </SectionHeading>
        </MediaSplit>
      </section>

      <section className="shell pb-section-y-sm lg:pb-section-y">
        <MediaSplit
          mediaFirst
          image={{
            alt: "A maker's workshop, where pieces are sourced",
            className: "aspect-4/3 lg:aspect-4/5",
          }}
        >
          <SectionHeading
            kicker="What we believe"
            tone="sage"
            title="Fewer things, made and sourced with more care."
          >
            <p>
              Every maker we work with is visited, not just emailed. We favor
              small studios, natural materials and finishes that age well
              instead of wearing out.
            </p>
            <p>
              That&rsquo;s a slower way to build a catalog. We think it&rsquo;s
              the only way worth building one.
            </p>
          </SectionHeading>
        </MediaSplit>
      </section>

      <section
        aria-labelledby="values-heading"
        className="shell pb-section-y-sm lg:pb-section-y-lg"
      >
        <SectionHeading
          align="center"
          id="values-heading"
          title="What guides every pick"
          className="mb-10"
        />
        <ul className="grid gap-5 lg:grid-cols-3 lg:gap-gutter">
          {VALUES.map((value) => (
            <li key={value.title}>
              <FeatureCard
                icon={value.icon}
                tone={value.tone}
                title={value.title}
              >
                {value.body}
              </FeatureCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="shell pb-section-y-sm lg:pb-section-y-lg">
        <CtaBand
          title="Come see what's new"
          actions={
            <>
              <Link href="/shop" className={buttonClasses()}>
                Shop the collection
              </Link>
              <Link
                href="/contact"
                className={buttonClasses({
                  variant: "quiet",
                  className:
                    "text-surface hover:bg-white/10 active:bg-white/15",
                })}
              >
                Contact us
              </Link>
            </>
          }
        >
          Browse the current collection, or reach out if you have a question we
          haven&rsquo;t answered.
        </CtaBand>
      </section>
    </>
  );
}
