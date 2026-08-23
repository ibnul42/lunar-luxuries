import Link from "next/link";

import { Card } from "@/components/ui/card";
import { WashedImage } from "@/components/ui/washed-image";
import { SITE } from "@/lib/site";

import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="shell py-section-y">
      {/* Same floor as /login — the taller form pushes past it on its own. */}
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
              <p className="kicker text-white/85">New here</p>
              <p className="font-display text-h2 text-white">
                A slower way to shop, from the first order
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
              <p className="kicker text-accent-700">Register</p>
              <h1 className="font-display text-h2">Create your account</h1>
              <p className="text-[15px] text-muted">
                Save your addresses, track orders and keep a wishlist of what
                you love.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </Card>
    </div>
  );
}
