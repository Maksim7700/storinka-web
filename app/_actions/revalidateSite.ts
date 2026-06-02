"use server";

// Invalidates Next data cache after admin mutations; uses updateTag for read-your-own-writes (single-arg revalidateTag is deprecated in this Next version).

import { updateTag } from "next/cache";
import { SITEMAP_TAG, siteTag } from "../_lib/cacheTags";

type Options = {
  /** Also invalidate the sitemap — set on publish/unpublish. */
  invalidateSitemap?: boolean;
};

export async function revalidateSite(
  subdomain: string,
  opts: Options = {},
): Promise<void> {
  // Defensive length cap — Next cache tags are limited to 256 chars.
  if (!subdomain || subdomain.length > 200) return;

  updateTag(siteTag(subdomain));
  if (opts.invalidateSitemap) {
    updateTag(SITEMAP_TAG);
  }
}
