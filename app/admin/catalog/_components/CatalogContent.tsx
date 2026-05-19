"use client";

import { useMemo, useState } from "react";
import type { TemplateSummary } from "../page";
import FilterDropdown from "./FilterDropdown";
import TemplateCard from "./TemplateCard";

const CATEGORY_LABELS: Record<string, string> = {
  beauty: "Краса",
  food: "Їжа",
  auto: "Авто",
  business: "Бізнес",
};

const ALL = "__all__";

export default function CatalogContent({
  templates,
}: {
  templates: TemplateSummary[];
}) {
  const [category, setCategory] = useState<string>(ALL);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of templates) {
      if (t.category) set.add(t.category);
    }
    return [
      { value: ALL, label: "Усі сфери" },
      ...Array.from(set).sort().map((c) => ({
        value: c,
        label: CATEGORY_LABELS[c] ?? c,
      })),
    ];
  }, [templates]);

  const filtered = useMemo(() => {
    if (category === ALL) return templates;
    return templates.filter((t) => t.category === category);
  }, [templates, category]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <FilterDropdown
          icon={<SphereIcon />}
          label="Сфера"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />
        <FilterDropdown
          icon={<SiteTypeIcon />}
          label="Тип сайту"
          disabled
        />
        <FilterDropdown
          icon={<FeaturesIcon />}
          label="Функції"
          disabled
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[20px] border border-[#E6E6E6] bg-white px-6 py-16 text-center text-sm text-gray-500">
          Немає шаблонів у цій сфері.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </>
  );
}

function SphereIcon() {
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
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function SiteTypeIcon() {
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
        d="M3 4.5h18M5.25 4.5v15a.75.75 0 00.75.75h12a.75.75 0 00.75-.75v-15M9 9h6M9 13.5h6M9 18h3"
      />
    </svg>
  );
}

function FeaturesIcon() {
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
        d="M3 4.5h18M6 12h12M10 19.5h4"
      />
    </svg>
  );
}
