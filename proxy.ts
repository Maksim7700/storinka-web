import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Root hostnames we own. Anything else passes through unmodified.
//   localhost     — dev. Browsers natively resolve *.localhost to 127.0.0.1.
//   storinka.ua   — prod. Wildcard DNS *.storinka.ua → our server.
const ROOT_DOMAINS = new Set(["localhost", "storinka.ua"]);

// Subdomains that must NOT route to the public site renderer.
// Mirrors SUBDOMAIN_RESERVED in the backend.
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

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();

  // Hostnames without a dot can't carry a subdomain.
  const parts = hostname.split(".");
  if (parts.length < 2) return NextResponse.next();

  const subdomain = parts[0];
  const root = parts.slice(1).join(".");

  if (!ROOT_DOMAINS.has(root) || RESERVED_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  // Internal rewrite to the public site renderer.
  // Browser URL stays as the user typed it; Next.js renders /s/[subdomain].
  const url = req.nextUrl.clone();
  url.pathname = `/s/${subdomain}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, static assets, our /api proxy target,
  // SEO discovery files (must be served at the root of every host so
  // crawlers can find them — including subdomain hosts), and .well-known/
  // probes (Chrome DevTools, ACME challenges, etc.).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\\.well-known).*)",
  ],
};
