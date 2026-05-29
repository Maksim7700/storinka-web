import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { buildJsonLd, serialiseJsonLd } from "../../_lib/jsonLd";
import { getTemplateComponent } from "../../_components/templates/registry";

type PublicSite = {
  subdomain: string;
  templateKey: string;
  contentJson: Record<string, unknown>;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
// Root domain used to build canonical / openGraph URLs. Override in prod
// via NEXT_PUBLIC_SITES_ROOT (e.g. "storinka.ua").
const SITES_ROOT = process.env.NEXT_PUBLIC_SITES_ROOT ?? "storinka.ua";

// React `cache()` dedupes the call within a single request, so both
// generateMetadata and the page component reuse one HTTP fetch.
const loadSite = cache(async (subdomain: string): Promise<PublicSite | null> => {
  const res = await fetch(
    `${BACKEND_URL}/api/vendors/${encodeURIComponent(subdomain)}/site`,
    { cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load site: ${res.status}`);
  }
  return res.json();
});

// Human-readable suffix per template — appears after the business name in
// the browser tab and search results (e.g. "Авто-Майстер — СТО ..."). Keep
// titles under ~60 chars so Google doesn't truncate them.
const TEMPLATE_SUFFIX: Record<string, string> = {
  sto: "СТО · ремонт авто",
  "beauty-salon": "Салон краси",
  restaurant: "Ресторан",
};

function titleFor(site: PublicSite): string {
  const name = String(site.contentJson.businessName ?? site.subdomain);
  const suffix = TEMPLATE_SUFFIX[site.templateKey];
  return suffix ? `${name} — ${suffix}` : name;
}

function descriptionFor(site: PublicSite): string {
  // Prefer the owner's own copy; fall back to a per-template generic line.
  // Generic copy is *better than nothing* for SEO, but every site sharing
  // it will look duplicate to Google — encourage owners to write their own.
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
    case "restaurant":
      return `${name}: меню, бронювання столика, доставка.`;
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
    // Even the 404 needs an absolute title — otherwise Next applies the root
    // "%s | Storinka" template and we'd render "Сайт не знайдено | Storinka"
    // for a non-existent client site.
    return { title: { absolute: "Сайт не знайдено" } };
  }

  const title = titleFor(site);
  const description = descriptionFor(site);
  const canonical = `https://${subdomain}.${SITES_ROOT}`;
  const businessName = String(site.contentJson.businessName ?? subdomain);

  return {
    // `absolute` bypasses the root layout's title template. The client's
    // brand stands alone — no "| Storinka" suffix on their public site.
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
    // The template was published but its React component isn't registered
    // yet. Surface this as not-found rather than a blank page.
    notFound();
  }

  const jsonLd = buildJsonLd(site, SITES_ROOT);

  return (
    <>
      {jsonLd && (
        // JSON-LD is a static, server-rendered <script> — Google reads it
        // from the initial HTML. dangerouslySetInnerHTML is correct here:
        // we control the input (no user-supplied HTML), and serialiseJsonLd
        // escapes the only injection vector inside JSON (`</`).
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
        />
      )}
      <Component content={site.contentJson as Record<string, unknown>} />
    </>
  );
}
