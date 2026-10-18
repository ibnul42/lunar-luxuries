"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { Button, buttonClasses } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { WashedImage } from "@/components/ui/washed-image";
import {
  type AdminProduct,
  PRODUCT_STATUS_OPTIONS,
  type ProductInput,
  type ProductStatus,
  useAdminCategories,
  useAdminProduct,
  useSaveProduct,
} from "@/lib/admin";
import { toFormErrors } from "@/lib/form-errors";
import { SITE } from "@/lib/site";
import { fromMinorUnits, toMinorUnits } from "@/lib/utils";

const BACK = { href: "/admin/products", label: "Back to products" };

function Fields({
  product,
  onSaved,
}: {
  product: AdminProduct | null;
  onSaved: (product: AdminProduct) => void;
}) {
  const categories = useAdminCategories();
  const save = useSaveProduct(product?.id ?? null);
  const [saved, setSaved] = useState(false);
  const [priceError, setPriceError] = useState<string>();
  const { fields, formMessage } = toFormErrors(save.error);

  // The design's "Saved ✓" confirmation, shown for 1.6s.
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(timer);
  }, [saved]);

  const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...(categories.data ?? []).flatMap((parent) => [
      { value: parent.id, label: parent.name },
      ...parent.children.map((child) => ({
        value: child.id,
        label: `${parent.name} › ${child.name}`,
      })),
    ]),
  ];
  const multiVariant = (product?.variants.length ?? 1) > 1;

  // `defaultValue` on the category select only applies to options present on
  // the first render, so the form must not mount before the tree has loaded.
  if (categories.isPending) return <Skeleton className="h-130" />;
  if (categories.error)
    return <FormAlert>{categories.error.message}</FormAlert>;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const priceCents = toMinorUnits(String(data.get("price") ?? ""));
    const compareRaw = String(data.get("compareAt") ?? "").trim();
    const compareAtPriceCents = compareRaw ? toMinorUnits(compareRaw) : null;
    if (priceCents === null || (compareRaw && compareAtPriceCents === null)) {
      setPriceError("Enter a price as a number, e.g. 6500.");
      return;
    }

    const input: ProductInput = {
      name: String(data.get("name") ?? ""),
      description: String(data.get("description") ?? ""),
      categoryId: String(data.get("categoryId") ?? ""),
      status: String(data.get("status")) as ProductStatus,
      priceCents,
      compareAtPriceCents,
      isFeatured: data.get("isFeatured") === "on",
      isNewArrival: data.get("isNewArrival") === "on",
      ...(multiVariant && product
        ? {
            variants: product.variants.map((v) => ({
              id: v.id,
              stockQty: Number(data.get(`stock-${v.id}`) ?? 0),
            })),
          }
        : { stockQty: Number(data.get("stockQty") ?? 0) }),
    };

    save.mutate(input, {
      onSuccess: (result) => {
        setSaved(true);
        onSaved(result);
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        setPriceError(undefined);
        if (save.error) save.reset();
      }}
      className="grid items-start gap-5 xl:grid-cols-[1fr_320px]"
    >
      <AdminPanel>
        <div className="space-y-5">
          {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
          <Input
            label="Product name"
            name="name"
            shape="admin"
            defaultValue={product?.name}
            maxLength={120}
            error={fields.name}
            required
          />
          <Textarea
            label="Description"
            name="description"
            shape="admin"
            rows={6}
            defaultValue={product?.description}
            hint="A blank line starts a new paragraph on the product page."
            error={fields.description}
            required
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Category"
              name="categoryId"
              shape="admin"
              defaultValue={product?.categoryId ?? ""}
              options={categoryOptions}
              error={fields.categoryId}
              required
            />
            <Select
              label="Status"
              name="status"
              shape="admin"
              defaultValue={product?.status ?? "DRAFT"}
              options={PRODUCT_STATUS_OPTIONS}
              error={fields.status}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={`Price (${SITE.currency})`}
              name="price"
              shape="admin"
              inputMode="decimal"
              defaultValue={product ? fromMinorUnits(product.priceCents) : ""}
              hint={multiVariant ? "Applies to every option." : undefined}
              error={priceError ?? fields.priceCents}
              required
            />
            <Input
              label="Compare-at price"
              name="compareAt"
              shape="admin"
              inputMode="decimal"
              defaultValue={
                product?.compareAtPriceCents != null
                  ? fromMinorUnits(product.compareAtPriceCents)
                  : ""
              }
              hint="Optional — shows as the struck-through “was” price."
              error={fields.compareAtPriceCents}
            />
          </div>

          {multiVariant && product ? (
            <fieldset className="space-y-3">
              <legend className="mb-2 text-[13px] font-semibold">
                Stock by option
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {product.variants.map((variant) => (
                  <Input
                    key={variant.id}
                    label={variant.label ?? variant.sku}
                    name={`stock-${variant.id}`}
                    type="number"
                    min={0}
                    shape="admin"
                    defaultValue={variant.stockQty}
                    required
                  />
                ))}
              </div>
            </fieldset>
          ) : (
            <div className="sm:w-1/2 sm:pr-2.5">
              <Input
                label="Stock quantity"
                name="stockQty"
                type="number"
                min={0}
                shape="admin"
                defaultValue={product?.variants[0]?.stockQty ?? 0}
                error={fields.stockQty}
                required
              />
            </div>
          )}

          <div className="flex flex-wrap gap-6 border-t border-border pt-5">
            <Checkbox
              name="isFeatured"
              label="Best selling (homepage)"
              defaultChecked={product?.isFeatured}
            />
            <Checkbox
              name="isNewArrival"
              label="New arrival"
              defaultChecked={product?.isNewArrival}
            />
          </div>
        </div>
      </AdminPanel>

      <div className="space-y-5 xl:sticky xl:top-9">
        <AdminPanel>
          <p className="mb-3 text-[13px] font-semibold">Product photo</p>
          <WashedImage
            src={product?.images[0]?.url}
            alt={product ? `${product.name} photo` : "No photo yet"}
            sizes="320px"
            className="aspect-4/5 rounded-card"
          />
          <p className="mt-3 flex items-start gap-2 text-[13px] text-muted">
            <ImagePlus
              size={16}
              strokeWidth={2.5}
              aria-hidden
              className="mt-0.5 shrink-0"
            />
            Uploads arrive with the media pipeline (README §1 — storage
            isn&rsquo;t chosen yet).
          </p>
        </AdminPanel>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="admin" disabled={save.isPending}>
            {save.isPending ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </Button>
          <Link
            href="/admin/products"
            className={buttonClasses({ variant: "secondary", size: "admin" })}
          >
            Cancel
          </Link>
          {product ? (
            <Link
              href={`/products/${product.slug}`}
              className="text-[13px] font-semibold text-accent-700 hover:text-accent-800"
            >
              View in store
            </Link>
          ) : null}
        </div>
        <p role="status" className="sr-only">
          {saved ? "Product saved." : ""}
        </p>
      </div>
    </form>
  );
}

/** Create (`id` null) or edit. */
export function ProductForm({ id }: { id: string | null }) {
  const router = useRouter();
  const { data, isPending, error } = useAdminProduct(id);

  const title = id ? "Edit product" : "New product";

  if (id && error) {
    return (
      <>
        <AdminPageHeader title={title} back={BACK} />
        <FormAlert>{error.message}</FormAlert>
      </>
    );
  }
  if (id && isPending) {
    return (
      <>
        <AdminPageHeader title={title} back={BACK} />
        <Skeleton className="h-130" />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader title={title} back={BACK} />
      <Fields
        key={data?.id ?? "new"}
        product={id ? (data ?? null) : null}
        onSaved={(product) => {
          // A new product moves to its own edit URL once it exists.
          if (!id) router.replace(`/admin/products/${product.id}`);
        }}
      />
    </>
  );
}
