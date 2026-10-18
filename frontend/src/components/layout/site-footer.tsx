import Link from "next/link";

import { FOOTER_NAV, SITE } from "@/lib/site";

import { NewsletterForm } from "./newsletter-form";
import type { NavCategory } from "./site-header";

export function SiteFooter({
  categories,
}: {
  categories: readonly NavCategory[];
}) {
  const columns = [
    {
      heading: "Shop",
      links: [
        { href: "/shop", label: "All products" },
        ...categories.map((c) => ({
          href: `/shop?category=${c.slug}`,
          label: c.name,
        })),
      ],
    },
    ...FOOTER_NAV,
  ];

  return (
    <footer className="mt-auto">
      {/* Email signup band — sage, the system's second voice. */}
      <section className="bg-sage-700 text-white">
        <div className="shell flex flex-col items-center gap-6 py-14 text-center lg:py-16">
          <div className="space-y-3">
            <p className="kicker text-white/80">Stay in touch</p>
            <h2 className="font-display text-[26px] leading-tight text-white sm:text-h2">
              Slow news, twice a month
            </h2>
            <p className="max-w-lg text-[15px] text-white/85">
              New arrivals, restocks and the occasional note from the makers. No
              noise.
            </p>
          </div>

          <NewsletterForm id="footer-email" />
        </div>
      </section>

      <div className="bg-surface">
        <div className="shell py-section-y-sm lg:py-section-y">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-column">
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <p className="font-display text-wordmark text-text">
                {SITE.name}
              </p>
              <p className="max-w-xs text-sm text-muted">{SITE.tagline}.</p>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-block text-sm font-semibold text-accent-700 hover:text-accent-800"
              >
                {SITE.supportEmail}
              </a>
            </div>

            {columns.map((column) => (
              <nav
                key={column.heading}
                aria-labelledby={`footer-${column.heading}`}
              >
                <h2
                  id={`footer-${column.heading}`}
                  className="mb-5 kicker text-text"
                >
                  {column.heading}
                </h2>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-accent-800"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted sm:flex-row sm:justify-between lg:mt-14">
            <span>
              © {new Date().getFullYear()} {SITE.name}. All rights reserved.
            </span>
            <span>Made with care, everywhere.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
