"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { type CategoryNode, SORTS } from "@/lib/catalog";

interface ShopFiltersProps {
  categories: CategoryNode[];
  selected: string[];
  sort: string;
}

/**
 * Facets live in the URL (`?category=a,b&sort=…`), so a filtered view can be
 * shared, bookmarked and reloaded, and the server renders it. Changing one
 * replaces the URL; the page re-renders on the server with the new results.
 */
function useFilterNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any filter change starts back at the first page.
    next.delete("page");
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return { update, isPending };
}

function FacetFields({
  categories,
  selected,
  sort,
  idPrefix,
}: ShopFiltersProps & { idPrefix: string }) {
  const { update, isPending } = useFilterNavigation();

  function toggle(slug: string, checked: boolean) {
    const next = checked
      ? [...selected, slug]
      : selected.filter((value) => value !== slug);
    update({ category: next.length ? next.join(",") : null });
  }

  return (
    <div className="flex flex-col gap-8" aria-busy={isPending}>
      <fieldset>
        <legend className="mb-4 kicker text-text">Category</legend>
        <div className="flex flex-col gap-3.5">
          {categories.map((category) => {
            const childSelected = category.children.some((c) =>
              selected.includes(c.slug),
            );
            const expanded = selected.includes(category.slug) || childSelected;
            return (
              <div key={category.slug} className="flex flex-col gap-3">
                <Checkbox
                  id={`${idPrefix}-${category.slug}`}
                  label={
                    <span className="flex gap-1.5">
                      {category.name}
                      <span className="text-muted">
                        ({category.productCount})
                      </span>
                    </span>
                  }
                  checked={selected.includes(category.slug)}
                  onChange={(event) =>
                    toggle(category.slug, event.target.checked)
                  }
                />
                {expanded && category.children.length > 0 ? (
                  <div className="ml-7 flex flex-col gap-3">
                    {category.children.map((child) => (
                      <Checkbox
                        key={child.slug}
                        id={`${idPrefix}-${child.slug}`}
                        label={
                          <span className="flex gap-1.5 font-normal">
                            {child.name}
                            <span className="text-muted">
                              ({child.productCount})
                            </span>
                          </span>
                        }
                        checked={selected.includes(child.slug)}
                        onChange={(event) =>
                          toggle(child.slug, event.target.checked)
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>

      <Select
        id={`${idPrefix}-sort`}
        label="Sort by"
        options={SORTS}
        value={sort}
        onChange={(event) =>
          update({
            sort: event.target.value === "featured" ? null : event.target.value,
          })
        }
        className="h-11 text-sm"
      />

      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => update({ category: null })}
          className="self-start text-[13px] font-semibold text-accent-700 hover:text-accent-800"
        >
          Clear categories
        </button>
      ) : null}
    </div>
  );
}

/** Sticky sidebar from `lg`; a "Filters" button and a sheet below it. */
export function ShopFilters(props: ShopFiltersProps) {
  const [open, setOpen] = useState(false);
  const active = props.selected.length;

  return (
    <>
      <aside
        aria-label="Filters"
        className="sticky top-[calc(var(--spacing-header)+24px)] hidden lg:block"
      >
        <FacetFields {...props} idPrefix="facet" />
      </aside>

      <div className="lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          <SlidersHorizontal size={16} strokeWidth={2.75} aria-hidden />
          Filter &amp; sort
          {active > 0 ? (
            <span className="rounded-pill bg-accent-600 px-2 py-0.5 text-[11px] text-white">
              {active}
            </span>
          ) : null}
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Filter & sort"
          variant="sheet"
        >
          <FacetFields {...props} idPrefix="sheet" />
          <Button className="mt-8 w-full" onClick={() => setOpen(false)}>
            Show results
          </Button>
        </Dialog>
      </div>
    </>
  );
}
