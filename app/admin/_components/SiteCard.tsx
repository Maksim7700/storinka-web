import Link from "next/link";
import { SendIcon } from "../../_components/icons";

const ROOT_DOMAIN = "storinka.ua";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

const STATUS_META: Record<SiteStatus, { label: string; className: string }> = {
  DRAFT: {
    label: "ЧЕРНЕТКА",
    className: "bg-gray-100 text-gray-700",
  },
  ACTIVE: {
    label: "АКТИВНО",
    className: "bg-green-100 text-green-700",
  },
  SUSPENDED: {
    label: "ЗАБЛОКОВАНО",
    className: "bg-red-100 text-red-700",
  },
  EXPIRED: {
    label: "ПРОСТРОЧЕНО",
    className: "bg-gray-200 text-gray-600",
  },
};

export type SiteSummary = {
  id: number;
  subdomain: string;
  status: SiteStatus;
  templateId: number;
  templateKey: string;
  templateName: string;
  templateThumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function SiteCard({ site }: { site: SiteSummary }) {
  const status = STATUS_META[site.status] ?? STATUS_META.DRAFT;

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white">
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        {site.templateThumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={site.templateThumbnailUrl}
            alt={site.templateName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Немає прев&apos;ю
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-semibold text-gray-900">{site.templateName}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {site.subdomain}.{ROOT_DOMAIN}
          </p>
        </div>

        <span
          className={`self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.className}`}
        >
          {status.label}
        </span>

        <Link
          href={`/admin/sites/${site.id}`}
          className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <SendIcon className="h-4 w-4" />
          Огляд
        </Link>
      </div>
    </article>
  );
}
