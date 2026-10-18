"use client";

import Link from "next/link";
import { CloudOff } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * A storefront page whose server-side data fetch failed — usually the API
 * being unreachable. The header and footer stay; only the page is replaced.
 */
export default function StorefrontError({ reset }: { reset: () => void }) {
  return (
    <div className="shell py-section-y-sm lg:py-section-y">
      <EmptyState
        icon={CloudOff}
        title="We couldn't load this page"
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset}>Try again</Button>
            <Link href="/" className={buttonClasses({ variant: "secondary" })}>
              Back to home
            </Link>
          </div>
        }
      >
        Something went wrong on our side, or the connection dropped. Give it a
        moment and try again.
      </EmptyState>
    </div>
  );
}
