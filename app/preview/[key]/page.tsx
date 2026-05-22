import { notFound } from "next/navigation";
import PreviewClient from "./_components/PreviewClient";

export type TemplateForPreview = {
  id: number;
  key: string;
  name: string;
  schemaJson: Record<string, unknown> | null;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

async function fetchTemplate(key: string): Promise<TemplateForPreview | null> {
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

export default async function TemplateFullPreviewPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const template = await fetchTemplate(key);
  if (!template) notFound();

  return <PreviewClient template={template} />;
}
