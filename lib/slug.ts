/**
 * Generates a clean URL‑friendly slug.
 * - Converts to lowercase
 * - Replaces any sequence of non‑alphanumeric characters with a single hyphen
 * - Removes leading and trailing hyphens
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
