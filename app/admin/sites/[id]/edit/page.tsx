import EditContentStep from "./_components/EditContentStep";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditContentStep siteId={Number(id)} />;
}
