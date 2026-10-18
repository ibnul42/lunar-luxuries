import { NotFoundContent } from "@/components/layout/not-found-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CATEGORIES } from "@/lib/site";

export const metadata = {
  title: "Page not found",
};

/**
 * An unmatched URL. It renders under the root layout only — outside any route
 * group — so it brings the storefront shell itself, with the static category
 * list (a 404 shouldn't wait on the API).
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader categories={CATEGORIES} />
      <main id="main" className="flex flex-1 flex-col">
        <NotFoundContent />
      </main>
      <SiteFooter categories={CATEGORIES} />
    </>
  );
}
