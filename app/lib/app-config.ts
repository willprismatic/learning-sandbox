/**
 * App-level configuration derived from environment variables.
 * Works in both server and client components (uses NEXT_PUBLIC_ prefix).
 */

/** Returns the company name from env, or "Demo App" as fallback. */
export function getCompanyName(): string {
  return process.env.NEXT_PUBLIC_COMPANY_NAME || 'Demo App';
}

/** Returns the configured resource type slug, or undefined if not set. */
export function getActiveResourceTypeSlug(): string | undefined {
  return process.env.NEXT_PUBLIC_RESOURCE_TYPE || undefined;
}
