import { SiteFooter } from "@/components/layout/site-footer";
import { type NavCategory, SiteHeader } from "@/components/layout/site-header";
import { getCategories } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/site";

/**
 * The live category list feeds the header's Shop menu and the footer, so an
 * admin hiding or adding a category shows up everywhere. If the API is down
 * the shell still renders, from the static list — the page itself will say
 * what went wrong.
 */
async function navCategories(): Promise<readonly NavCategory[]> {
  try {
    const tree = await getCategories();
    return tree.map(({ slug, name }) => ({ slug, name }));
  } catch {
    return CATEGORIES;
  }
}

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const categories = await navCategories();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-pill focus:bg-surface focus:px-6 focus:py-3 focus:font-semibold focus:shadow-card"
      >
        Skip to content
      </a>
      <SiteHeader categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={categories} />
    </>
  );
}
