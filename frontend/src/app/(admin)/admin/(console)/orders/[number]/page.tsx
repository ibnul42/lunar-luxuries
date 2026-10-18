import { OrderView } from "./order-view";

export async function generateMetadata({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  return { title: `Order #${number}` };
}

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  return <OrderView number={decodeURIComponent(number)} />;
}
