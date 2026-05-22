import EditDomainStep from "./_components/EditDomainStep";

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditDomainStep siteId={Number(id)} />;
}
