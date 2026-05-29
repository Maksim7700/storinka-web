// Schema.org / JSON-LD builder for public site pages.
//
// What this is for: Google reads <script type="application/ld+json"> blocks
// to understand a page's entities (business, address, phone, opening hours,
// services...). Properly tagged local-business pages get "rich results" —
// the phone / map / star rating displayed directly in search results.
// Without JSON-LD, Google has to guess from the HTML and often guesses wrong.
//
// Each template maps to the most specific Schema.org type Google supports
// for that vertical:
//   - sto          → AutoRepair
//   - beauty-salon → BeautySalon
//   - restaurant   → Restaurant
//
// All three extend LocalBusiness, so common fields (name, telephone, address,
// image, url, priceRange) work the same way.

type SiteForJsonLd = {
  subdomain: string;
  templateKey: string;
  contentJson: Record<string, unknown>;
};

type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": string;
  name: string;
  url: string;
  // Fields below are all optional in schema.org — included only when we
  // have real values for them. Omitting beats faking, because Google may
  // penalise contradictory data (e.g. a fake address that doesn't exist).
  telephone?: string;
  email?: string;
  image?: string;
  priceRange?: string;
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressCountry: "UA";
  };
  servesCuisine?: string;
  hasOfferCatalog?: {
    "@type": "OfferCatalog";
    name: string;
    itemListElement: Array<{
      "@type": "Offer";
      itemOffered: { "@type": "Service"; name: string };
    }>;
  };
};

const TYPE_BY_TEMPLATE: Record<string, string> = {
  sto: "AutoRepair",
  "beauty-salon": "BeautySalon",
  restaurant: "Restaurant",
};

function str(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// Same logic as StoTemplate uses to split the free-form services field.
function parseServices(raw: unknown): string[] {
  const s = str(raw);
  if (!s) return [];
  return s
    .split(/[\n;,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// Build the absolute URL of the public site. Mirrors generateMetadata.
function buildUrl(subdomain: string, root: string): string {
  return `https://${subdomain}.${root}`;
}

// Resolve an image field that may be a relative path (e.g. "/api/files/xxx")
// to an absolute URL Google can fetch. JSON-LD images should be absolute.
function absolutiseImage(image: string | undefined, root: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // Files live on the backend; in prod we'll have a public CDN/proxy URL.
  // For now, hard-code the root domain — the proxy in next.config.ts forwards
  // /api/* to the backend, so the same path works from any subdomain.
  return `https://api.${root}${image.startsWith("/") ? image : `/${image}`}`;
}

export function buildJsonLd(
  site: SiteForJsonLd,
  sitesRoot: string,
): LocalBusinessJsonLd | null {
  const type = TYPE_BY_TEMPLATE[site.templateKey];
  if (!type) return null;

  const c = site.contentJson;
  const name = str(c.businessName) ?? site.subdomain;
  const url = buildUrl(site.subdomain, sitesRoot);

  const jsonLd: LocalBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    url,
  };

  const telephone = str(c.phone);
  if (telephone) jsonLd.telephone = telephone;

  const email = str(c.email);
  if (email) jsonLd.email = email;

  const image = absolutiseImage(str(c.photo), sitesRoot);
  if (image) jsonLd.image = image;

  // Loose street address. We don't ask for city/country separately yet, so
  // we just hand Google whatever the owner typed. The country tag is safe
  // to hard-code — Storinka is UA-only for now.
  const address = str(c.address) ?? str(c.map);
  if (address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "UA",
    };
  }

  // Restaurant-specific
  const cuisine = str(c.cuisine);
  if (cuisine && type === "Restaurant") {
    jsonLd.servesCuisine = cuisine;
  }

  // List of services as an OfferCatalog — STO has this as a free-form field.
  const services = parseServices(c.services);
  if (services.length > 0) {
    jsonLd.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `Послуги — ${name}`,
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s },
      })),
    };
  }

  return jsonLd;
}

/**
 * Safely serialise the JSON-LD object for embedding inside a <script> tag.
 * The only dangerous sequence inside JSON is `</`, which can prematurely
 * close the script element. Escape it to `<\/`.
 */
export function serialiseJsonLd(jsonLd: unknown): string {
  return JSON.stringify(jsonLd).replace(/<\//g, "<\\/");
}
