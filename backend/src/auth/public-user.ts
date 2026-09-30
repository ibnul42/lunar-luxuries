import type { Prisma } from "../generated/prisma/client";

/**
 * The only user fields that ever leave the API. Every query that returns a user
 * to a client selects through this, so `passwordHash` is absent by
 * construction rather than stripped after the fact.
 */
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

/**
 * Copies the public fields off a wider row (one that also selected
 * `passwordHash`, say). The return type makes a field added to the select
 * above a compile error here until it is copied too.
 */
export function toPublicUser(user: PublicUser): PublicUser {
  const { id, email, name, role, emailVerifiedAt, createdAt } = user;
  return { id, email, name, role, emailVerifiedAt, createdAt };
}
