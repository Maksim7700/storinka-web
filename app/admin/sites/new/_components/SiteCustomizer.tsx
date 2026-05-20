"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeftIcon, SendIcon } from "../../../../_components/icons";
import { getTemplateComponent } from "../../../../_components/templates/registry";
import type { TemplateField, TemplateForWizard } from "../page";
import ContentForm from "./ContentForm";
import DomainModal from "./DomainModal";

function initialContentFromSchema(
  fields: TemplateField[],
): Record<string, string | number> {
  const initial: Record<string, string | number> = {};
  for (const f of fields) {
    if (f.default !== undefined) initial[f.key] = f.default;
  }
  return initial;
}

export default function SiteCustomizer({
  template,
}: {
  template: TemplateForWizard;
}) {
  const fields = template.schemaJson?.fields ?? [];

  const [content, setContent] = useState<Record<string, string | number>>(() =>
    initialContentFromSchema(fields),
  );
  const [domainOpen, setDomainOpen] = useState(false);

  const Component = useMemo(
    () => getTemplateComponent(template.key),
    [template.key],
  );

  function updateField(key: string, value: string | number) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top toolbar: breadcrumb + "Обрати домен" CTA */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E6E6E6] bg-white px-6 py-3">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link
            href={`/admin/catalog/${template.key}`}
            aria-label="Назад до шаблону"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <Link href="/admin/catalog" className="hover:text-gray-900">
            Каталог
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">{template.name}</span>
        </nav>

        <button
          type="button"
          onClick={() => setDomainOpen(true)}
          className="flex h-10 items-center gap-2 rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <SendIcon className="h-4 w-4" />
          Обрати домен
        </button>
      </header>

      {/* Split layout: live preview (2/3) + form (1/3) */}
      <div className="flex flex-1 overflow-hidden">
        <section
          className="flex-[2] overflow-y-auto bg-white"
          aria-label="Live preview"
        >
          {Component ? (
            <Component content={content} />
          ) : (
            <div className="flex h-full items-center justify-center p-10 text-center text-sm text-gray-500">
              Для цього шаблону живий рендер ще не реалізовано.
            </div>
          )}
        </section>

        <aside
          className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-[#E6E6E6] bg-white p-6"
          aria-label="Edit form"
        >
          <ContentForm
            fields={fields}
            values={content}
            onChange={updateField}
          />
        </aside>
      </div>

      {domainOpen && (
        <DomainModal
          templateId={template.id}
          content={content}
          onClose={() => setDomainOpen(false)}
        />
      )}
    </div>
  );
}
