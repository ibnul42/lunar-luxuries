import Link from "next/link";

import { Card } from "@/components/ui/card";
import { WashedImage } from "@/components/ui/washed-image";
import { SITE } from "@/lib/site";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="shell py-section-y">
      <Card className="grid overflow-hidden lg:min-h-[680px] lg:grid-cols-2">
        <WashedImage
          alt="Lunar Luxuries seasonal still life"
          scrim
          sizes="50vw"
          className="hidden lg:block"
        >
          <div className="flex h-full flex-col justify-between p-14">
            <Link href="/" className="font-display text-wordmark text-white">
              {SITE.name}
            </Link>
            <div className="max-w-sm space-y-3">
              <p className="kicker text-white/85">Welcome back</p>
              <p className="font-display text-h2 text-white">
                Considered goods, right where you left them
              </p>
            </div>
          </div>
        </WashedImage>

        <div className="flex flex-col justify-center px-8 py-12 sm:px-14">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <Link
              href="/"
              className="block font-display text-wordmark text-text lg:hidden"
            >
              {SITE.name}
            </Link>

            <div className="space-y-2">
              <p className="kicker text-accent-700">Sign in</p>
              <h1 className="font-display text-h2">Welcome back</h1>
              <p className="text-[15px] text-muted">
                Sign in to view your orders, wishlist and saved addresses.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </Card>
    </div>
  );
}
