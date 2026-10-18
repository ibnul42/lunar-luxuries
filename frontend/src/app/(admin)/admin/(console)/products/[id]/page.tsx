import { ProductForm } from "../product-form";

export const metadata = {
  title: "Edit product",
};

export default async function AdminProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  return <ProductForm id={id} />;
}
