import { Suspense } from "react";

import { AccountView } from "./account-view";

export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="shell pt-8 pb-section-y-sm lg:pt-10 lg:pb-section-y-lg">
      <h1 className="mb-8 font-display text-[30px] leading-tight sm:text-h2 lg:mb-10">
        My account
      </h1>
      {/* `useSearchParams` in a static page needs a Suspense boundary. */}
      <Suspense>
        <AccountView />
      </Suspense>
    </div>
  );
}
