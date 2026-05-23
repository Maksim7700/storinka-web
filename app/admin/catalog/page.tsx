import CatalogContent from "./_components/CatalogContent";

export const dynamic = "force-dynamic";

export type TemplateSummary = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  licensePrice: number;
  monthlyPrice: number;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function fetchTemplates(): Promise<TemplateSummary[]> {
  const res = await fetch(`${BACKEND_URL}/api/templates`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to load templates: ${res.status}`);
  }
  return res.json();
}

export default async function AdminCatalogPage() {
  const templates = await fetchTemplates();

  return (
    <div className="px-16 py-8">
      <CatalogContent templates={templates} />
    </div>
  );
}
