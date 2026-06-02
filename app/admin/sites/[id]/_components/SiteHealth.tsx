"use client";

import type { TemplateField } from "../../_components/ContentForm";

// Client-computed SEO completeness checklist — updates live as the owner edits fields.

type Level = "required" | "recommended" | "optional";

type CheckItem = {
  id: string;
  label: string;
  passed: boolean;
  level: Level;
  hint?: string;
};

type Props = {
  template: { schemaJson: { fields?: TemplateField[] } | null } | null;
  content: Record<string, string | number>;
  seo: {
    gscVerification: string | null;
    gaMeasurementId: string | null;
  };
};

/** Exported so the parent tab strip can show the count without rendering the full component. */
export function buildChecklist(
  template: Props["template"],
  content: Props["content"],
  seo: Props["seo"],
): CheckItem[] {
  const items: CheckItem[] = [];

  const value = (k: string) => String(content[k] ?? "").trim();
  const hasContent = (k: string, min = 1) => value(k).length >= min;

  // Template owns its own required-field definition — loop works for any future template.
  const fields = template?.schemaJson?.fields ?? [];
  for (const f of fields) {
    // Skip colour/non-text fields — can't meaningfully check completeness.
    if (f.type === "color") continue;

    const min = f.key === "description" ? 50 : 1;
    items.push({
      id: `content.${f.key}`,
      label: f.label,
      passed: hasContent(f.key, min),
      level: f.required ? "required" : "recommended",
      hint:
        f.key === "description"
          ? "Опис під 50 символів Google не сприймає серйозно — напишіть 1-2 повних речення."
          : undefined,
    });
  }

  // Integration checks — independent of template.
  items.push({
    id: "seo.gsc",
    label: "Google Search Console",
    passed: Boolean((seo.gscVerification ?? "").trim()),
    level: "recommended",
    hint: "Без GSC ви не побачите які запити приводять людей на сайт.",
  });
  items.push({
    id: "seo.ga",
    label: "Google Analytics",
    passed: Boolean((seo.gaMeasurementId ?? "").trim()),
    level: "optional",
    hint: "GA показує скільки людей заходить і звідки.",
  });

  return items;
}

/** Count of failed REQUIRED items only — keeps the tab badge a real-problem signal. */
export function countMissingRequired(items: CheckItem[]): number {
  return items.filter((i) => !i.passed && i.level === "required").length;
}

export default function SiteHealth({ template, content, seo }: Props) {
  const items = buildChecklist(template, content, seo);

  const passed = items.filter((i) => i.passed).length;
  const total = items.length;
  const percent = total === 0 ? 100 : Math.round((passed / total) * 100);

  // Failed first (required > recommended > optional), then passed in insertion order.
  const sorted = [...items].sort((a, b) => {
    if (a.passed !== b.passed) return a.passed ? 1 : -1;
    if (a.passed) return 0;
    const w = { required: 0, recommended: 1, optional: 2 } as const;
    return w[a.level] - w[b.level];
  });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Перевірка сайту
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Чим повніше заповнений сайт, тим краще його розуміє Google і тим
          вища ймовірність потрапити у топ видачі.
        </p>
      </div>

      <ScoreCard passed={passed} total={total} percent={percent} />

      <ul className="space-y-1.5">
        {sorted.map((item) => (
          <ChecklistRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

// --- subcomponents -------------------------------------------------------

function ScoreCard({
  passed,
  total,
  percent,
}: {
  passed: number;
  total: number;
  percent: number;
}) {
  // < 50% red, < 80% amber, ≥ 80% green.
  const tier =
    percent >= 80
      ? { bar: "bg-green-500", text: "text-green-700", label: "Чудово" }
      : percent >= 50
        ? { bar: "bg-amber-500", text: "text-amber-700", label: "Можна краще" }
        : { bar: "bg-red-500", text: "text-red-700", label: "Потребує уваги" };

  return (
    <div className="rounded-xl border border-[#E6E6E6] bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{passed}</span>
          <span className="text-sm text-gray-500">/ {total}</span>
        </div>
        <span className={`text-xs font-semibold ${tier.text}`}>
          {tier.label}
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full transition-all ${tier.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ChecklistRow({ item }: { item: CheckItem }) {
  return (
    <li
      className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${
        item.passed ? "bg-gray-50" : "bg-white border border-[#E6E6E6]"
      }`}
    >
      <StatusIcon passed={item.passed} level={item.level} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm ${
              item.passed
                ? "font-medium text-gray-500 line-through"
                : "font-semibold text-gray-900"
            }`}
          >
            {item.label}
          </p>
          {!item.passed && <LevelBadge level={item.level} />}
        </div>
        {!item.passed && item.hint && (
          <p className="mt-1 text-xs leading-snug text-gray-500">{item.hint}</p>
        )}
      </div>
    </li>
  );
}

function StatusIcon({ passed, level }: { passed: boolean; level: Level }) {
  if (passed) {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M5 12l5 5L20 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  const cls =
    level === "required"
      ? "bg-red-100 text-red-700"
      : level === "recommended"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-500";
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cls}`}
    >
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function LevelBadge({ level }: { level: Level }) {
  if (level === "required") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
        Обовʼязково
      </span>
    );
  }
  if (level === "recommended") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
        Рекомендовано
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      Опційно
    </span>
  );
}
