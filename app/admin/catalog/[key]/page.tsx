import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
} from "../../../_components/styles";

type TemplateFeature = { label: string; icon?: string };

type TemplateSchema = {
  fields?: unknown[];
  tags?: string[];
  features?: TemplateFeature[];
};

type TemplateDetails = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  schemaJson: TemplateSchema | null;
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
  const tags = template.schemaJson?.tags ?? [];
  const features = template.schemaJson?.features ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 text-sm text-gray-500">
        <Link href="/admin/catalog" className="hover:text-gray-900">
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
                  <FeatureIcon type={f.icon} />
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
              <SendIcon />
              Персоналізувати шаблон
            </Link>
            <button
              type="button"
              disabled
              title="Скоро — повний рендер шаблону у новій вкладці"
              className={`${BTN_SECONDARY_CLASS} gap-2`}
            >
              <EyeIcon />
              Повне прев&apos;ю
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ type }: { type?: string }) {
  const className = "h-4 w-4 shrink-0 text-gray-500";
  if (type === "file") {
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    );
  }
  // Default: signal / wifi icon
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
