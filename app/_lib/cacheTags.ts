// Shared cache-tag builders so callers can't typo the tag name.

/** Tag for a single site fetch (page + OG image). */
export function siteTag(subdomain: string): string {
  return `site:${subdomain.toLowerCase()}`;
}

/** Tag for the cross-site sitemap listing. */
export const SITEMAP_TAG = "sitemap";
