"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, SendIcon } from "../../../../_components/icons";
import { buildDefaults } from "../../../../_components/templates/_internal";
import {
  getTemplateComponent,
  getTemplateFields,
} from "../../../../_components/templates/registry";
import { loadDraft, saveDraft } from "../../../../_lib/draftState";
import { usePreviewScroll } from "../../../../_lib/usePreviewScroll";
import ContentForm from "../../_components/ContentForm";
import type { TemplateForWizard } from "../page";

export default function SiteCustomizer({
  template,
}: {
  template: TemplateForWizard;
}) {
  const router = useRouter();
  const fields = getTemplateFields(template.key);

  const [content, setContent] = useState<Record<string, unknown>>(() =>
    buildDefaults(fields),
  );

  // On mount: if there is an in-progress draft for THIS template (e.g. user
  // hit back from the domain step), restore so they don't lose work.
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.templateKey === template.key) {
      setContent(draft.content);
    }
    // Only run once after initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Component = useMemo(
    () => getTemplateComponent(template.key),
    [template.key],
  );

  function updateField(key: string, value: unknown) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  const { previewRef, focusPreview } = usePreviewScroll();

  function handleProceed() {
    saveDraft({
      templateId: template.id,
      templateKey: template.key,
      content,
    });
    router.push(
      `/admin/sites/new/domain?template=${encodeURIComponent(template.key)}`,
    );
  }

  return (
    <div className="flex h-full flex-col">
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
          onClick={handleProceed}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <SendIcon className="h-4 w-4" />
          Обрати домен
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section
          ref={previewRef}
          className="flex-[2] overflow-y-auto bg-white"
          aria-label="Живе прев'ю"
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
          aria-label="Форма редагування"
        >
          <ContentForm
            fields={fields}
            values={content}
            onChange={updateField}
            onFieldFocus={focusPreview}
          />
        </aside>
      </div>
    </div>
  );
}
