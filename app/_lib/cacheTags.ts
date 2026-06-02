// Cache-tag helpers — shared between the public site fetches (which apply
// the tag) and the Server Actions that invalidate it. Centralising the
// name-builders keeps the string format consistent: a typo anywhere
// silently breaks invalidation, which is the worst kind of bug.

/**
 * Tag applied to every fetch that reads a single published site by its
 * subdomain (the public page + its dynamic OG image). Invalidate this
 * after any admin mutation that changes what the public site renders.
 */
export function siteTag(subdomain: string): string {
  // Subdomains are validated server-side, but normalise here too just in
  // case — cache tags are case-sensitive, so an inconsistent case would
  // silently miss invalidation.
  return `site:${subdomain.toLowerCase()}`;
}

/**
 * Tag applied to the root-domain sitemap fetch (lists every active site).
 * Invalidate when a site becomes ACTIVE/INACTIVE so the listing reflects
 * publish/unpublish without waiting for the periodic revalidate window.
 */
export const SITEMAP_TAG = "sitemap";
