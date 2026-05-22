import { notFound, redirect } from "next/navigation";
import type { TemplateField } from "../_components/ContentForm";
import SiteCustomizer from "./_components/SiteCustomizer";

export type TemplateForWizard = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  schemaJson: { fields?: TemplateField[] } | null;
  licensePrice: number;
  monthlyPrice: number;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function fetchTemplate(key: string): Promise<TemplateForWizard | null> {
  const res = await fetch(
    `${BACKEND_URL}/api/templates/${encodeURIComponent(key)}`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load template: ${res.status}`);
  }
  return res.json();
}

export default async function NewSitePage({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise and must be awaited.
  searchParams: Promise<{ template?: string }>;
}) {
  const params = await searchParams;
  if (!params.template) {
    redirect("/admin/catalog");
  }

  const template = await fetchTemplate(params.template);
  if (!template) notFound();

  return <SiteCustomizer template={template} />;
}
