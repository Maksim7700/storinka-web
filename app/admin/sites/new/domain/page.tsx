import { redirect } from "next/navigation";
import DomainPicker from "./_components/DomainPicker";

export default async function ChooseDomainPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const params = await searchParams;
  if (!params.template) {
    redirect("/admin/catalog");
  }
  // Draft (content + templateId) lives in sessionStorage — fetched
  // client-side. If absent, the client component redirects to /admin/catalog.
  return <DomainPicker templateKey={params.template} />;
}
