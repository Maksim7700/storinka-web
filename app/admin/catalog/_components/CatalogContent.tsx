"use client";

import { useMemo, useState } from "react";
import {
  FeaturesIcon,
  SiteTypeIcon,
  SphereIcon,
} from "../../../_components/icons";
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
const FILTER_ICON_CLASS = "h-4 w-4";

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
          icon={<SphereIcon className={FILTER_ICON_CLASS} />}
          label="Сфера"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />
        <FilterDropdown
          icon={<SiteTypeIcon className={FILTER_ICON_CLASS} />}
          label="Тип сайту"
          disabled
        />
        <FilterDropdown
          icon={<FeaturesIcon className={FILTER_ICON_CLASS} />}
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
