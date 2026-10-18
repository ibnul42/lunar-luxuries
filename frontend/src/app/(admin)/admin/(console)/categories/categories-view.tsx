"use client";

import { type FormEvent, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import {
  type AdminCategory,
  type CategoryStatus,
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/admin";
import { toFormErrors } from "@/lib/form-errors";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "HIDDEN", label: "Hidden" },
] as const;

function NewCategoryForm({ onDone }: { onDone: () => void }) {
  const create = useCreateCategory();
  const { fields, formMessage } = toFormErrors(create.error);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    create.mutate(
      {
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
        status: String(data.get("status")) as CategoryStatus,
      },
      { onSuccess: onDone },
    );
  }

  return (
    <AdminPanel className="mb-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formMessage ? <FormAlert>{formMessage}</FormAlert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Input
            label="Name"
            name="name"
            shape="admin"
            maxLength={60}
            error={fields.name}
            required
            autoFocus
          />
          <Select
            label="Status"
            name="status"
            shape="admin"
            options={STATUS_OPTIONS}
            defaultValue="ACTIVE"
          />
        </div>
        <Input
          label="Description"
          name="description"
          shape="admin"
          hint="Optional — shown on the category's shop page."
          maxLength={500}
          error={fields.description}
        />
        <Button type="submit" size="admin" disabled={create.isPending}>
          {create.isPending ? "Creating…" : "Create category"}
        </Button>
      </form>
    </AdminPanel>
  );
}

function SubcategoryForm({
  parent,
  onDone,
}: {
  parent: AdminCategory;
  onDone: () => void;
}) {
  const create = useCreateCategory();
  const [name, setName] = useState("");
  const { fields, formMessage } = toFormErrors(create.error);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate({ name, parentId: parent.id }, { onSuccess: onDone });
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <Input
          label={`New subcategory of ${parent.name}`}
          hideLabel
          placeholder="Subcategory name"
          shape="admin"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fields.name ?? formMessage}
          maxLength={60}
          autoFocus
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="admin" disabled={create.isPending}>
          Add
        </Button>
        <Button type="button" size="admin" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Delete with an inline confirm; the API refuses while products remain. */
function DeleteButton({ id, name }: { id: string; name: string }) {
  const remove = useDeleteCategory();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex flex-wrap items-center justify-end gap-3 text-[13px] font-semibold">
        {remove.error ? (
          <span role="alert" className="max-w-xs text-left text-danger">
            {remove.error.message}
          </span>
        ) : (
          <span>Delete {name}?</span>
        )}
        {remove.error ? null : (
          <button
            type="button"
            onClick={() => remove.mutate(id)}
            disabled={remove.isPending}
            className="text-danger hover:underline"
          >
            {remove.isPending ? "Deleting…" : "Delete"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            remove.reset();
            setConfirming(false);
          }}
          className="text-muted hover:text-text"
        >
          {remove.error ? "OK" : "Cancel"}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${name}`}
      className="grid size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-accent-100 hover:text-danger"
    >
      <Trash2 size={16} strokeWidth={2.5} aria-hidden />
    </button>
  );
}

function StatusToggle({
  id,
  status,
  name,
}: {
  id: string;
  status: CategoryStatus;
  name: string;
}) {
  const update = useUpdateCategory();
  const next: CategoryStatus = status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
  return (
    <button
      type="button"
      onClick={() => update.mutate({ id, status: next })}
      disabled={update.isPending}
      title={`Click to ${next === "HIDDEN" ? "hide" : "show"}`}
      aria-label={`${name}: ${status === "ACTIVE" ? "active" : "hidden"}. ${next === "HIDDEN" ? "Hide" : "Show"} it in the store`}
      className="rounded-pill disabled:opacity-60"
    >
      <StatusPill status={status} />
    </button>
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);
  const childrenId = `subcategories-${category.id}`;

  return (
    <li className="border-b border-border last:border-0">
      <div className="flex flex-wrap items-center gap-3 py-3.5">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={childrenId}
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronRight
            size={18}
            strokeWidth={2.75}
            aria-hidden
            className={cn(
              "shrink-0 text-muted transition-transform",
              expanded && "rotate-90",
            )}
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{category.name}</span>
            <span className="block text-[13px] text-muted">
              {category.productCount}{" "}
              {category.productCount === 1 ? "product" : "products"} ·{" "}
              {category.children.length}{" "}
              {category.children.length === 1 ? "subcategory" : "subcategories"}
            </span>
          </span>
        </button>
        <StatusToggle
          id={category.id}
          status={category.status}
          name={category.name}
        />
        <DeleteButton id={category.id} name={category.name} />
      </div>

      <div
        id={childrenId}
        hidden={!expanded}
        className="mb-4 ml-7 rounded-nav bg-subtle p-3 sm:p-4"
      >
        {category.children.length > 0 ? (
          <ul className="mb-3 divide-y divide-border">
            {category.children.map((child) => (
              <li
                key={child.id}
                className="flex flex-wrap items-center gap-3 py-2.5"
              >
                <span className="min-w-0 flex-1 text-sm">
                  {child.name}
                  <span className="ml-2 text-[13px] text-muted">
                    {child.productCount}{" "}
                    {child.productCount === 1 ? "product" : "products"}
                  </span>
                </span>
                <StatusToggle
                  id={child.id}
                  status={child.status}
                  name={child.name}
                />
                <DeleteButton id={child.id} name={child.name} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-[13px] text-muted">No subcategories yet.</p>
        )}
        {adding ? (
          <SubcategoryForm parent={category} onDone={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-700 hover:text-accent-800"
          >
            <Plus size={15} strokeWidth={2.75} aria-hidden />
            Add subcategory
          </button>
        )}
      </div>
    </li>
  );
}

export function CategoriesView() {
  const { data, isPending, error } = useAdminCategories();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        subtitle={data ? `${data.length} categories` : " "}
        actions={
          <Button
            size="admin"
            variant={showForm ? "secondary" : "primary"}
            aria-expanded={showForm}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} strokeWidth={2.75} aria-hidden />
                Add category
              </>
            )}
          </Button>
        }
      />

      {showForm ? <NewCategoryForm onDone={() => setShowForm(false)} /> : null}

      <AdminPanel>
        {error ? (
          <FormAlert>{error.message}</FormAlert>
        ) : isPending ? (
          <Skeleton className="h-80" />
        ) : (
          <ul>
            {data.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </AdminPanel>
    </>
  );
}
