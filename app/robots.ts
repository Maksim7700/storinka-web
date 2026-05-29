import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// SEO: tell crawlers what they can index and where to find the sitemap.
//
// Per-host: served at both `storinka.ua/robots.txt` and
// `<subdomain>.storinka.ua/robots.txt`. The sitemap URL always points to
// /sitemap.xml on the same host — the sitemap.ts file is itself host-aware,
// so the right URLs are returned for each.

const SITES_ROOT = process.env.NEXT_PUBLIC_SITES_ROOT ?? "storinka.ua";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // headers() makes this route dynamic — required so the same robots.ts
  // returns the right Host-specific sitemap URL.
  const host = (await headers()).get("host") ?? SITES_ROOT;
  const protocol = host.startsWith("localhost") || host.includes(".localhost")
    ? "http"
    : "https";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal app surfaces — useful for owners, useless (and noisy) in
      // Google's index. Blocking is courtesy; auth still protects them.
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${protocol}://${host}/sitemap.xml`,
  };
}
