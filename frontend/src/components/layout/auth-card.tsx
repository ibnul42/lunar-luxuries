import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

/** The centred single-card layout of Forgot Password and its reset step. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="shell flex justify-center py-section-y-sm lg:py-section-y">
      <Card className="w-full max-w-lg px-6 py-10 sm:px-12 sm:py-12">
        <div className="mx-auto max-w-form">{children}</div>
      </Card>
    </div>
  );
}
