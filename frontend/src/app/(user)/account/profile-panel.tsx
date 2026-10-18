"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useChangePassword, useUpdateProfile } from "@/lib/account";
import type { SessionUser } from "@/lib/auth/api";
import { toFormErrors } from "@/lib/form-errors";

/** Mirrors `MIN_PASSWORD_LENGTH` in backend/src/auth/auth.dto.ts. */
const MIN_PASSWORD_LENGTH = 8;

function Saved({ show, children }: { show: boolean; children: string }) {
  return (
    <p role="status" className="text-sm font-semibold text-sage-700">
      {show ? children : ""}
    </p>
  );
}

export function ProfilePanel({ user }: { user: SessionUser }) {
  const profile = useUpdateProfile();
  const password = useChangePassword();
  const [passwordFormKey, setPasswordFormKey] = useState(0);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    profile.mutate({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
    });
  }

  function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    password.mutate(
      {
        currentPassword: String(data.get("currentPassword") ?? ""),
        newPassword: String(data.get("newPassword") ?? ""),
      },
      // Remount the form so the password fields don't keep their values.
      { onSuccess: () => setPasswordFormKey((k) => k + 1) },
    );
  }

  const profileErrors = toFormErrors(profile.error);
  const passwordErrors = toFormErrors(password.error);

  return (
    <div className="space-y-8">
      <Card elevation="panel" className="p-6 sm:p-8">
        <h2 className="mb-6 font-display text-xl">Profile</h2>
        <form
          onSubmit={saveProfile}
          onChange={() => {
            if (profile.error || profile.isSuccess) profile.reset();
          }}
          className="max-w-lg space-y-5"
        >
          {profileErrors.formMessage ? (
            <FormAlert>{profileErrors.formMessage}</FormAlert>
          ) : null}
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            defaultValue={user.name}
            maxLength={100}
            error={profileErrors.fields.name}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={user.email}
            error={profileErrors.fields.email}
            required
          />
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={profile.isPending}>
              {profile.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Saved show={profile.isSuccess}>Saved ✓</Saved>
          </div>
        </form>
      </Card>

      <Card elevation="panel" className="p-6 sm:p-8">
        <h2 className="mb-2 font-display text-xl">Password</h2>
        <p className="mb-6 text-sm text-muted">
          Changing it signs you out on every other device.
        </p>
        <form
          key={passwordFormKey}
          onSubmit={savePassword}
          onChange={() => {
            if (password.error) password.reset();
          }}
          className="max-w-lg space-y-5"
        >
          {passwordErrors.formMessage ? (
            <FormAlert>{passwordErrors.formMessage}</FormAlert>
          ) : null}
          <PasswordInput
            label="Current password"
            name="currentPassword"
            autoComplete="current-password"
            error={passwordErrors.fields.currentPassword}
            required
          />
          <PasswordInput
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            error={passwordErrors.fields.newPassword}
            required
          />
          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              variant="secondary"
              disabled={password.isPending}
            >
              {password.isPending ? "Updating…" : "Update password"}
            </Button>
            <Saved show={password.isSuccess}>Password updated ✓</Saved>
          </div>
        </form>
      </Card>
    </div>
  );
}
