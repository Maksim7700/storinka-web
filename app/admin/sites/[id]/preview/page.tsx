import PreviewSummary from "./_components/PreviewSummary";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewSummary siteId={Number(id)} />;
}
