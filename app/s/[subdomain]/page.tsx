import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { cache } from "react";
import { siteTag } from "../../_lib/cacheTags";
import { buildJsonLd, serialiseJsonLd } from "../../_lib/jsonLd";
import { getTemplateComponent } from "../../_components/templates/registry";

type PublicSite = {
  subdomain: string;
  templateKey: string;
  contentJson: Record<string, unknown>;
  /** Optional GSC HTML-tag verification code. Becomes a meta tag in <head>. */
  gscVerification: string | null;
  /** Optional GA4 measurement ID, e.g. "G-XXXXXXXXXX". Becomes a gtag script. */
  gaMeasurementId: string | null;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
// Override via NEXT_PUBLIC_SITES_ROOT for prod (e.g. "storinka.ua").
const SITES_ROOT = process.env.NEXT_PUBLIC_SITES_ROOT ?? "storinka.ua";

// React cache() dedupes within a request; ISR + tag handles cross-request caching with admin invalidation via revalidateSite().
const loadSite = cache(async (subdomain: string): Promise<PublicSite | null> => {
  const res = await fetch(
    `${BACKEND_URL}/api/vendors/${encodeURIComponent(subdomain)}/site`,
    { next: { revalidate: 300, tags: [siteTag(subdomain)] } },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load site: ${res.status}`);
  }
  return res.json();
});

// Per-template suffix appended to the business name in tab/search titles (keep under 60 chars total).
const TEMPLATE_SUFFIX: Record<string, string> = {
  sto: "СТО · ремонт авто",
  "beauty-salon": "Салон краси",
};

function titleFor(site: PublicSite): string {
  const name = String(site.contentJson.businessName ?? site.subdomain);
  const suffix = TEMPLATE_SUFFIX[site.templateKey];
  return suffix ? `${name} — ${suffix}` : name;
}

function descriptionFor(site: PublicSite): string {
  // Owner's copy wins; fallback is per-template generic (duplicate across sites — SEO mediocre).
  const content = site.contentJson as Record<string, unknown>;
  const explicit = content.description ?? content.tagline;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.trim().slice(0, 160);
  }

  const name = String(content.businessName ?? site.subdomain);
  switch (site.templateKey) {
    case "sto":
      return `${name}: ремонт авто, діагностика, ТО. Чесні строки та прозорі ціни. Записатись за телефоном.`;
    case "beauty-salon":
      return `${name}: салон краси. Стрижки, фарбування, манікюр, догляд. Запис онлайн.`;
    default:
      return name;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await loadSite(subdomain);

  if (!site) {
    // `absolute` bypasses the root "%s | Storinka" template.
    return { title: { absolute: "Сайт не знайдено" } };
  }

  const title = titleFor(site);
  const description = descriptionFor(site);
  const canonical = `https://${subdomain}.${SITES_ROOT}`;
  const businessName = String(site.contentJson.businessName ?? subdomain);

  return {
    // Client's brand stands alone — no "| Storinka" suffix.
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: businessName,
      locale: "uk_UA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
    // Renders <meta name="google-site-verification"> for GSC property claim.
    ...(site.gscVerification
      ? { verification: { google: site.gscVerification } }
      : {}),
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await loadSite(subdomain);
  if (!site) notFound();

  const Component = getTemplateComponent(site.templateKey);
  if (!Component) {
    // Template published but no React component registered yet.
    notFound();
  }

  const jsonLd = buildJsonLd(site, SITES_ROOT);

  // Validate ID format so an admin typo can't inject arbitrary script via gtag URL.
  const gaId = isValidGaId(site.gaMeasurementId) ? site.gaMeasurementId : null;

  return (
    <>
      {jsonLd && (
        // serialiseJsonLd escapes `</`; input is controlled, so dangerouslySetInnerHTML is safe here.
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
        />
      )}

      {gaId && (
        // GA4 via gtag, deferred to afterInteractive so analytics never blocks.
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      <Component content={site.contentJson as Record<string, unknown>} />
    </>
  );
}

// Accept G-/UA-/AW-/DC- prefixes with safe suffix chars only; anything else is dropped.
function isValidGaId(id: string | null | undefined): id is string {
  if (!id) return false;
  return /^(G|UA|AW|DC)-[A-Z0-9-]{3,30}$/i.test(id);
}
