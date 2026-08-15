import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex flex-1 flex-col items-center justify-center gap-6 py-section-y-lg text-center">
      <p className="kicker text-accent-700">404</p>
      <h1 className="font-display text-h1">We can&rsquo;t find that page</h1>
      <p className="max-w-md text-muted">
        The link may be out of date, or the piece may have sold out and been
        retired.
      </p>
      <Link href="/" className={buttonClasses()}>
        Back to home
      </Link>
    </div>
  );
}
