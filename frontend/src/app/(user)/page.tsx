import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { WashedImage } from "@/components/ui/washed-image";
import { CATEGORIES, SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="shell pt-10">
        <WashedImage
          alt="Lunar Luxuries seasonal hero"
          scrim
          priority
          sizes="(max-width: 1440px) 100vw, 1440px"
          className="h-[560px] rounded-card"
        >
          <div className="flex h-full max-w-xl flex-col justify-end gap-6 p-14">
            <p className="kicker text-white/85">New season</p>
            <h1 className="font-display text-h1 text-white">
              Considered goods for a slower home
            </h1>
            <p className="text-lg text-white/90">{SITE.description}</p>
            <div className="flex gap-3">
              <Link href="/shop" className={buttonClasses()}>
                Shop all
              </Link>
              <Link
                href="/about"
                className={buttonClasses({ variant: "secondary" })}
              >
                Our story
              </Link>
            </div>
          </div>
        </WashedImage>
      </section>

      <section className="shell py-section-y">
        <div className="mb-10 flex items-end justify-between gap-6">
          <SectionHeading
            kicker="Browse"
            title="Shop by category"
            className="space-y-3"
          />
          <Link
            href="/shop"
            className="text-sm font-semibold text-accent-700 hover:text-accent-800"
          >
            View everything →
          </Link>
        </div>

        <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/shop?category=${category.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden transition-transform group-hover:-translate-y-1">
                  <WashedImage
                    alt={`${category.name} category`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-64"
                  />
                  <CardBody className="flex items-center justify-between">
                    <CardTitle>{category.name}</CardTitle>
                    <span
                      aria-hidden
                      className="text-accent-700 transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </CardBody>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
