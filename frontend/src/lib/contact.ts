import { apiFetch } from "@/lib/api";

/** Mirrors `ContactDto` in backend/src/contact/contact.dto.ts. */
export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Mirrors the DTO's limits, so the browser stops an overlong field first. */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
} as const;

export async function sendContactMessage(input: ContactInput): Promise<void> {
  await apiFetch<void>("/contact", { json: input });
}
