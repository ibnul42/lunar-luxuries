import { CartView } from "./cart-view";

export const metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

/** The cart is per-visitor, so the page is a shell and the leaf fetches it. */
export default function CartPage() {
  return (
    <div className="shell pt-8 pb-section-y-sm lg:pt-10 lg:pb-section-y-lg">
      <h1 className="mb-8 font-display text-[30px] leading-tight sm:text-h2 lg:mb-10">
        Your cart
      </h1>
      <CartView />
    </div>
  );
}
