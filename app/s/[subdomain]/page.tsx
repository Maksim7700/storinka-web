import { notFound } from "next/navigation";
import { getTemplateComponent } from "../../_components/templates/registry";

type PublicSite = {
  subdomain: string;
  templateKey: string;
  contentJson: Record<string, unknown>;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function fetchPublicSite(subdomain: string): Promise<PublicSite | null> {
  // No auth — this is the same endpoint that the public subdomain SSR will
  // hit in production (host-rewrite middleware will land here too).
  const res = await fetch(
    `${BACKEND_URL}/api/vendors/${encodeURIComponent(subdomain)}/site`,
    { cache: "no-store" },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load site: ${res.status}`);
  }
  return res.json();
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const site = await fetchPublicSite(subdomain);
  if (!site) notFound();

  const Component = getTemplateComponent(site.templateKey);
  if (!Component) {
    // The template was published but its React component isn't registered yet.
    // Surface this as not-found rather than a blank page.
    notFound();
  }

  return <Component content={site.contentJson as Record<string, unknown>} />;
}
