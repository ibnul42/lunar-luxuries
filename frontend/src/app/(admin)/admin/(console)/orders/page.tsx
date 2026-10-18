import { Suspense } from "react";

import { OrdersView } from "./orders-view";

export const metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    // `useSearchParams` in a static page needs a Suspense boundary.
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
