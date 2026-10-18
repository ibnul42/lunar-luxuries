import { MemberOrder } from "./member-order";

export async function generateMetadata({
  params,
}: PageProps<"/orders/[number]">) {
  const { number } = await params;
  return {
    title: `Order #${number}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({
  params,
}: PageProps<"/orders/[number]">) {
  const { number } = await params;

  return (
    <div className="shell max-w-5xl pt-8 pb-section-y-sm lg:pt-10 lg:pb-section-y-lg">
      <MemberOrder number={decodeURIComponent(number)} />
    </div>
  );
}
