import { WishlistView } from "./wishlist-view";

export const metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="shell pt-8 pb-section-y-sm lg:pt-10 lg:pb-section-y-lg">
      <h1 className="mb-8 font-display text-[30px] leading-tight sm:text-h2 lg:mb-10">
        Your wishlist
      </h1>
      <WishlistView />
    </div>
  );
}
