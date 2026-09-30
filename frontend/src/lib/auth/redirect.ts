/**
 * Where to go after signing in, from `?next=`.
 *
 * Only same-site paths are honoured: an attacker who can choose the target of
 * a post-login redirect can bounce a freshly authenticated visitor to a
 * look-alike site. Anything that is not a plain path falls back to the home
 * page.
 */
export function safeNextPath(search: string): string {
  const value = new URLSearchParams(search).get("next");

  if (!value?.startsWith("/")) return "/";
  // "//evil.com" and "/\evil.com" are protocol-relative URLs, not paths.
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";

  return value;
}
