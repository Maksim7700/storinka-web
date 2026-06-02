import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITEMAP_TAG } from "./_lib/cacheTags";

// SEO: generated sitemap for whichever host the request lands on.
//
// Two modes:
//   1) Root domain (storinka.ua)         → marketing pages + ALL active
//      client subdomains. Helps Google discover newly published sites.
//   2) Subdomain (<name>.storinka.ua)    → only that single site's root URL.
//      Each client site is independent in Google's eyes; cross-listing
//      siblings here would be wrong (they're not pages of THIS site).
//
// The route is forced dynamic via headers() — same code path serves both.

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const SITES_ROOT = process.env.NEXT_PUBLIC_SITES_ROOT ?? "storinka.ua";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "mail",
  "static",
  "cdn",
  "app",
  "support",
  "billing",
]);

type SitemapEntry = { subdomain: string; updatedAt: string };

async function fetchAllSites(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/vendors/sitemap`, {
      // Hourly auto-refresh; revalidateSite() busts the tag on publish/unpublish.
      next: { revalidate: 3600, tags: [SITEMAP_TAG] },
    });
    if (!res.ok) return [];
    return (await res.json()) as SitemapEntry[];
  } catch {
    // Best-effort: never break the sitemap because the backend is down.
    return [];
  }
}

/** Split a host into [subdomain | null, rootDomain]. */
function parseHost(host: string): { subdomain: string | null; root: string } {
  // Strip port (`:3000`) for parsing.
  const bare = host.split(":")[0].toLowerCase();
  const parts = bare.split(".");
  if (parts.length < 2) return { subdomain: null, root: bare };

  const first = parts[0];
  const root = parts.slice(1).join(".");

  // Treat reserved (www, admin, ...) as "root" — these are platform surfaces,
  // not client sites.
  if (RESERVED_SUBDOMAINS.has(first)) {
    return { subdomain: null, root };
  }
  return { subdomain: first, root };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") ?? SITES_ROOT;
  const protocol = host.startsWith("localhost") || host.includes(".localhost")
    ? "http"
    : "https";

  const { subdomain, root } = parseHost(host);

  // Mode 1 — subdomain. Single entry for the client's own root URL.
  if (subdomain) {
    return [
      {
        url: `${protocol}://${subdomain}.${root}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }

  // Mode 2 — root domain. Marketing pages + every active client subdomain.
  const sites = await fetchAllSites();

  const marketing: MetadataRoute.Sitemap = [
    {
      url: `${protocol}://${root}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${protocol}://${root}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${protocol}://${root}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const clientSites: MetadataRoute.Sitemap = sites.map((s) => ({
    url: `${protocol}://${s.subdomain}.${root}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...marketing, ...clientSites];
}
