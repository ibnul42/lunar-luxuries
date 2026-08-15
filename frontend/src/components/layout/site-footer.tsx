import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FOOTER_NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto">
      {/* Email signup band — sage, the system's second voice. */}
      <section className="bg-sage-700 text-white">
        <div className="shell flex flex-col items-center gap-6 py-16 text-center">
          <div className="space-y-3">
            <p className="kicker text-white/80">Stay in touch</p>
            <h2 className="font-display text-h2 text-white">
              Slow news, twice a month
            </h2>
            <p className="max-w-lg text-[15px] text-white/85">
              New arrivals, restocks and the occasional note from the makers. No
              noise.
            </p>
          </div>

          {/* TODO: wire to the newsletter double opt-in endpoint (README §5). */}
          <form className="flex w-full max-w-md gap-3">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-control flex-1 rounded-pill bg-white/95 px-6 text-[15px] text-text placeholder:text-text/55"
            />
            <Button type="submit" variant="secondary">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      <div className="bg-surface">
        <div className="shell py-section-y">
          <div className="grid gap-column md:grid-cols-4">
            <div className="space-y-4">
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

            {FOOTER_NAV.map((column) => (
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

          <div className="mt-14 border-t border-border pt-8 text-sm text-muted">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
