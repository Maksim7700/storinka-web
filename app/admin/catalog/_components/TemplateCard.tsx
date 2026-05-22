import Link from "next/link";
import { SendIcon } from "../../../_components/icons";
import type { TemplateSummary } from "../page";

const numberFormat = new Intl.NumberFormat("uk-UA");

// Category → (display label, badge bg color).
// Falls back to gray + the raw value if a new category appears.
const CATEGORY_META: Record<string, { label: string; bg: string }> = {
  beauty: { label: "САЛОН КРАСИ", bg: "#EC4899" },
  food: { label: "РЕСТОРАН", bg: "#F97316" },
  auto: { label: "АВТО", bg: "#3B82F6" },
  business: { label: "БІЗНЕС", bg: "#10B981" },
};

export default function TemplateCard({
  template,
}: {
  template: TemplateSummary;
}) {
  const meta = template.category ? CATEGORY_META[template.category] : null;
  const badgeLabel = meta?.label ?? template.category?.toUpperCase();

  return (
    <Link
      href={`/admin/catalog/${template.key}`}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white transition hover:shadow-md"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
        {template.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Немає прев&apos;ю
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-base font-semibold text-gray-900">
              {numberFormat.format(template.licensePrice)} грн
            </p>
            <p className="text-xs text-gray-500">Разовий платіж</p>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {numberFormat.format(template.monthlyPrice)} грн/міс
            </p>
            <p className="text-xs text-gray-500">Щомісячний платіж</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          {template.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {template.description}
            </p>
          )}
        </div>

        {badgeLabel && (
          <div className="flex flex-wrap gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: meta?.bg ?? "#6B7280" }}
            >
              {badgeLabel}
            </span>
          </div>
        )}

        <div className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-900 text-sm font-semibold text-white transition group-hover:bg-neutral-800">
          <SendIcon className="h-4 w-4" />
          Огляд
        </div>
      </div>
    </Link>
  );
}
