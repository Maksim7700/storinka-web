// Schema.org JSON-LD builder for public sites — maps each template to the most specific LocalBusiness subtype Google supports.

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
  // Optional in schema.org — omit when missing to avoid Google penalising fake data.
  telephone?: string;
  email?: string;
  image?: string;
  priceRange?: string;
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressCountry: "UA";
  };
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

// JSON-LD images must be absolute URLs — resolve relative paths through the api subdomain.
function absolutiseImage(image: string | undefined, root: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
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

  // Storinka is UA-only for now, so hard-code the country tag.
  const address = str(c.address) ?? str(c.map);
  if (address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "UA",
    };
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

/** Serialise JSON-LD for a <script> tag — escapes `</` to prevent early element close. */
export function serialiseJsonLd(jsonLd: unknown): string {
  return JSON.stringify(jsonLd).replace(/<\//g, "<\\/");
}
