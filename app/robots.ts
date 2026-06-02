import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// Per-host robots.txt — sitemap URL always points to the same host's /sitemap.xml.

const SITES_ROOT = process.env.NEXT_PUBLIC_SITES_ROOT ?? "storinka.ua";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // headers() forces dynamic so the per-host sitemap URL is correct.
  const host = (await headers()).get("host") ?? SITES_ROOT;
  const protocol = host.startsWith("localhost") || host.includes(".localhost")
    ? "http"
    : "https";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Internal app surfaces — blocked for tidiness (auth protects them anyway).
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${protocol}://${host}/sitemap.xml`,
  };
}
