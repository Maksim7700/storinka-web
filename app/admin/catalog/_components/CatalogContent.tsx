"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SphereIcon, SupportIcon } from "../../../_components/icons";
import FilterDropdown from "../../_components/FilterDropdown";
import type { TemplateSummary } from "../page";
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
      ...Array.from(set)
        .sort()
        .map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
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
          icon={<SphereIcon className="h-4 w-4" />}
          label="Сфера"
          value={category}
          options={categoryOptions}
          onChange={setCategory}
        />

        <Link
          href="/support"
          aria-label="Не знайшли підходящий шаблон? Напишіть у підтримку"
          className="group ml-auto flex h-10 cursor-pointer items-center gap-2 rounded-full border border-[#E6E6E6] bg-white pl-3 pr-1.5 text-sm text-gray-700 transition hover:border-neutral-900 hover:shadow-sm"
        >
          <SupportIcon className="h-4 w-4 text-gray-500 transition group-hover:text-neutral-900" />
          <span className="hidden md:inline">
            Не знайшли підходящий шаблон?
          </span>
          <span className="md:hidden">Не знайшли шаблон?</span>
          <span className="flex h-7 items-center gap-1 rounded-full bg-neutral-900 pl-3 pr-2.5 text-xs font-semibold text-white transition group-hover:bg-neutral-800">
            Підтримка
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </Link>
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
