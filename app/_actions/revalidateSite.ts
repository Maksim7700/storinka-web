"use server";

// Server Action invoked from admin client components after a successful
// mutation against the backend. Its only job is to flip the relevant
// Next.js cache tags so the next request to the public site / sitemap
// fetches fresh data from Spring instead of serving the cached blob.
//
// Why `updateTag` and not `revalidateTag('max')`:
//   - `updateTag` is read-your-own-writes: the next request blocks and
//     refetches, so the owner sees their save reflected immediately.
//   - `revalidateTag(_, 'max')` is stale-while-revalidate: it returns the
//     STALE version once before refreshing. For a "Save → open site in
//     new tab" flow that's confusing — owner sees old data and assumes
//     the save didn't work. Not worth the marginal latency win.
//
// Why single-arg `revalidateTag(tag)` isn't used: deprecated in this
// version of Next (see node_modules/next/dist/docs/.../revalidateTag.md).

import { updateTag } from "next/cache";
import { SITEMAP_TAG, siteTag } from "../_lib/cacheTags";

type Options = {
  /**
   * Also invalidate the cross-site sitemap. Set on publish/unpublish —
   * those are the only mutations that change which sites appear in the
   * root-domain sitemap.xml. Content/SEO edits don't need this.
   */
  invalidateSitemap?: boolean;
};

export async function revalidateSite(
  subdomain: string,
  opts: Options = {},
): Promise<void> {
  // Subdomain is owner-supplied and already validated server-side; we
  // still cap length defensively because cache tags are hard-limited to
  // 256 chars in Next, and a malformed string here would silently break
  // the invalidation for THIS request without any error surfacing.
  if (!subdomain || subdomain.length > 200) return;

  updateTag(siteTag(subdomain));
  if (opts.invalidateSitemap) {
    updateTag(SITEMAP_TAG);
  }
}
