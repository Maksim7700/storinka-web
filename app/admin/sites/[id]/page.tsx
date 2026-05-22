import SiteEditor from "./_components/SiteEditor";

export default async function SiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Site fetch happens client-side because it requires the JWT from
  // localStorage. Server just hands the id to the client component.
  return <SiteEditor siteId={Number(id)} />;
}
