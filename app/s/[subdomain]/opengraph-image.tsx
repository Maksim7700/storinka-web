// Dynamic Open Graph image for each client subdomain — rendered server-side
// at request time by Satori (via next/og's ImageResponse).
//
// What it does: when a link to <subdomain>.storinka.ua is shared on
// Telegram / Facebook / Twitter / WhatsApp etc., the scraper hits this
// route, gets a 1200x630 PNG with the business name + type + tagline,
// and renders it as the link preview. Without this, the preview falls
// back to a generic Storinka image (or nothing).
//
// Next.js automatically wires the resulting <meta property="og:image">
// (and width / height / type) into the page <head> because the file is
// colocated with /s/[subdomain]/page.tsx.
//
// Note on font loading: we deliberately don't ship custom fonts here.
// Satori falls back to system fonts which is enough for an OG card and
// keeps the image generator fast (no font parse on every miss).

import { ImageResponse } from "next/og";
import { siteTag } from "../../_lib/cacheTags";

export const alt = "Storinka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

type PublicSite = {
  subdomain: string;
  templateKey: string;
  contentJson: Record<string, unknown>;
};

const TEMPLATE_LABEL: Record<string, string> = {
  sto: "СТО · РЕМОНТ АВТО",
  "beauty-salon": "САЛОН КРАСИ",
  restaurant: "РЕСТОРАН",
};

// Per-template accent colour. Keeps each OG image visually tied to the
// template's hero palette so the link preview matches the landing page.
const TEMPLATE_ACCENT: Record<string, string> = {
  sto: "#F59E0B",
  "beauty-salon": "#C9A86C",
  restaurant: "#DC2626",
};

// Shares the page's cache tag so OG card invalidates with the HTML on save.
async function loadSite(subdomain: string): Promise<PublicSite | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/vendors/${encodeURIComponent(subdomain)}/site`,
      { next: { revalidate: 300, tags: [siteTag(subdomain)] } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function str(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

export default async function Image({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await loadSite(subdomain);

  const businessName =
    str(site?.contentJson.businessName) ?? subdomain;
  const label = site
    ? TEMPLATE_LABEL[site.templateKey] ?? "STORINKA"
    : "STORINKA";
  const accent = site
    ? TEMPLATE_ACCENT[site.templateKey] ?? "#F59E0B"
    : "#F59E0B";

  // Description text comes from either explicit description, tagline,
  // or — last resort — phone/address so the card is never empty.
  const c = site?.contentJson ?? {};
  const subtitle =
    str(c.description) ??
    str(c.tagline) ??
    [str(c.phone), str(c.address) ?? str(c.map)].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F172A",
          color: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top — small type label with accent bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 8,
              height: 40,
              background: accent,
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 4,
              color: accent,
            }}
          >
            {label}
          </div>
        </div>

        {/* Middle — business name + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              // Satori doesn't support multi-line clamp; rely on font-size to
              // keep typical Ukrainian business names on 1-2 lines.
            }}
          >
            {businessName}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.3,
                color: "#CBD5E1",
                // Hard cap so very long descriptions don't push the footer off
                // the canvas — Satori has no native ellipsis either.
                maxWidth: 1000,
              }}
            >
              {subtitle.length > 180
                ? `${subtitle.slice(0, 177)}...`
                : subtitle}
            </div>
          )}
        </div>

        {/* Bottom — Storinka attribution */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#64748B",
            fontSize: 24,
          }}
        >
          <div>{subdomain}.storinka.ua</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Створено з</span>
            <span style={{ color: "#FFFFFF", fontWeight: 700 }}>Storinka</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
