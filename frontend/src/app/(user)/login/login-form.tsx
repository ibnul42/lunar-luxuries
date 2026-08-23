"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-8">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setIsSubmitting(true);
        }}
      >
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end px-1">
            <Link
              href="/forgot-password"
              className="text-[13px] font-semibold text-accent-700 hover:text-accent-800"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Checkbox name="remember" label="Remember me" />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-semibold tracking-wide text-muted uppercase">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* TODO: wire to Auth.js Google/Apple OAuth providers */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" className="w-full">
          Google
        </Button>
        <Button variant="secondary" className="w-full">
          Apple
        </Button>
      </div>

      <p className="text-center text-[13px] text-muted">
        New to Lunar Luxuries?{" "}
        <Link
          href="/register"
          className="font-semibold text-accent-700 hover:text-accent-800"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
