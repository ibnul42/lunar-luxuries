import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

/** The Not Found design's message, shared by both 404 boundaries. */
export function NotFoundContent() {
  return (
    <div className="shell flex flex-1 flex-col items-center justify-center gap-6 py-section-y-lg text-center">
      <p className="font-display text-[88px] leading-none text-accent-300 sm:text-[120px]">
        404
      </p>
      <h1 className="font-display text-[32px] leading-tight text-balance sm:text-title">
        This page has wandered off.
      </h1>
      <p className="max-w-md text-[16px] leading-relaxed text-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        Let&rsquo;s get you back to something considered.
      </p>
      <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={buttonClasses()}>
          Back to home
        </Link>
        <Link href="/shop" className={buttonClasses({ variant: "secondary" })}>
          Shop all
        </Link>
      </div>
    </div>
  );
}
