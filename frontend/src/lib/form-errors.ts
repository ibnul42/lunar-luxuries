import { ApiError } from "@/lib/api";

export interface FormErrors {
  /** Keyed by field name, to hand straight to an input's `error` prop. */
  fields: Readonly<Record<string, string>>;
  /** Shown above the submit button when no single field is to blame. */
  formMessage?: string;
}

const NO_ERRORS: FormErrors = { fields: {} };

/**
 * Sorts a failed mutation into "point at this input" and "say this above the
 * button", so a message is never shown twice or lost entirely.
 */
export function toFormErrors(error: unknown): FormErrors {
  if (!error) return NO_ERRORS;

  if (error instanceof ApiError) {
    const fields = error.fieldErrors;
    return Object.keys(fields).length > 0
      ? { fields }
      : { fields: {}, formMessage: error.message };
  }

  return {
    fields: {},
    formMessage: "Something went wrong. Please try again.",
  };
}
