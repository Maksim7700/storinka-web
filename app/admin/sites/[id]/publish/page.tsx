import PublishStep from "./_components/PublishStep";

export default async function PublishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublishStep siteId={Number(id)} />;
}
