import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeftIcon,
  EyeIcon,
  FileIcon,
  SendIcon,
  SignalIcon,
} from "../../../_components/icons";
import {
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
} from "../../../_components/styles";
import { getTemplateMeta } from "../../../_components/templates/registry";

type TemplateDetails = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  // schemaJson still returned by backend but we read tags/features from the
  // code-side registry — never trust this field anymore.
  licensePrice: number;
  monthlyPrice: number;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const CATEGORY_META: Record<string, { label: string; bg: string }> = {
  beauty: { label: "САЛОН КРАСИ", bg: "#EC4899" },
  food: { label: "РЕСТОРАН", bg: "#F97316" },
  auto: { label: "АВТО", bg: "#3B82F6" },
  business: { label: "БІЗНЕС", bg: "#10B981" },
};

const FEATURE_ICON_CLASS = "h-4 w-4 shrink-0 text-gray-500";
const numberFormat = new Intl.NumberFormat("uk-UA");

async function fetchTemplate(key: string): Promise<TemplateDetails | null> {
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

export default async function TemplatePreviewPage({
  params,
}: {
  // Next.js 16: params is a Promise and must be awaited.
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const template = await fetchTemplate(key);
  if (!template) notFound();

  const meta = template.category ? CATEGORY_META[template.category] : null;
  const codeMeta = getTemplateMeta(template.key);
  const tags = codeMeta?.tags ?? [];
  const features = codeMeta?.features ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 text-sm text-gray-500">
        <Link href="/admin/catalog" className="inline-flex items-center gap-1 hover:text-gray-900">
          <ChevronLeftIcon className="h-4 w-4" />
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{template.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Preview image */}
        <div className="aspect-[16/10] overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-gray-100">
          {template.thumbnailUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Немає прев&apos;ю
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="flex flex-col gap-5 rounded-[20px] border border-[#E6E6E6] bg-white p-6">
          {/* Price box */}
          <div className="flex overflow-hidden rounded-[10px] border border-[#E6E6E6]">
            <div className="flex-1 border-r border-[#E6E6E6] p-3">
              <p className="text-lg font-bold text-gray-900">
                {numberFormat.format(template.licensePrice)} грн
              </p>
              <p className="mt-1 text-xs text-gray-500">Разовий платіж</p>
            </div>
            <div className="flex-1 p-3">
              <p className="text-lg font-bold text-gray-900">
                {numberFormat.format(template.monthlyPrice)} грн/міс
              </p>
              <p className="mt-1 text-xs text-gray-500">Щомісячний платіж</p>
            </div>
          </div>

          {/* Title + description */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {template.name}
            </h1>
            {template.description && (
              <p className="mt-2 text-sm text-gray-600">
                {template.description}
              </p>
            )}
          </div>

          {/* Tags row: category badge + extra tags */}
          {(meta || tags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {meta && (
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                  style={{ backgroundColor: meta.bg }}
                >
                  {meta.label}
                </span>
              )}
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Features list */}
          {features.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {features.map((f, idx) => (
                <li
                  key={`${f.label}-${idx}`}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  {f.icon === "file" ? (
                    <FileIcon className={FEATURE_ICON_CLASS} />
                  ) : (
                    <SignalIcon className={FEATURE_ICON_CLASS} />
                  )}
                  {f.label}
                </li>
              ))}
            </ul>
          )}

          {/* CTA buttons */}
          <div className="mt-auto flex flex-col gap-3 pt-2">
            <Link
              href={`/admin/sites/new?template=${encodeURIComponent(template.key)}`}
              className={`${BTN_PRIMARY_CLASS} gap-2`}
            >
              <SendIcon className="h-4 w-4" />
              Персоналізувати шаблон
            </Link>
            <Link
              href={`/preview/${encodeURIComponent(template.key)}`}
              className={`${BTN_SECONDARY_CLASS} gap-2`}
            >
              <EyeIcon className="h-4 w-4" />
              Повне прев&apos;ю
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
