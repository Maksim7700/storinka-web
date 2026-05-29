"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, SendIcon } from "../../../../../_components/icons";
import { getTemplateComponent } from "../../../../../_components/templates/registry";
import ContentForm, {
  type TemplateField,
} from "../../../_components/ContentForm";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";

type Site = {
  id: number;
  subdomain: string;
  status: SiteStatus;
  templateId: number;
  templateKey: string;
  templateName: string;
  templateThumbnailUrl: string | null;
  contentJson: Record<string, string | number>;
};

type Template = {
  id: number;
  key: string;
  name: string;
  schemaJson: { fields?: TemplateField[] } | null;
};

export default function EditContentStep({ siteId }: { siteId: number }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [content, setContent] = useState<Record<string, string | number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!Number.isFinite(siteId)) {
        setLoadError("Невірний ідентифікатор сайту");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const siteRes = await fetch(`/api/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (siteRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (siteRes.status === 404) {
          setLoadError("Сайт не знайдено");
          return;
        }
        if (!siteRes.ok) throw new Error(`HTTP ${siteRes.status}`);
        const loadedSite: Site = await siteRes.json();
        if (cancelled) return;

        const tplRes = await fetch(
          `/api/templates/${encodeURIComponent(loadedSite.templateKey)}`,
        );
        if (!tplRes.ok) throw new Error(`HTTP ${tplRes.status}`);
        const loadedTpl: Template = await tplRes.json();
        if (cancelled) return;

        setSite(loadedSite);
        setTemplate(loadedTpl);
        setContent(loadedSite.contentJson ?? {});
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Помилка завантаження");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [siteId, router]);

  const Component = useMemo(
    () => (template ? getTemplateComponent(template.key) : null),
    [template?.key],
  );
  const fields = template?.schemaJson?.fields ?? [];

  function updateField(key: string, value: string | number) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleProceed() {
    if (!site) return;
    setSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${site.id}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ contentJson: content }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setSaveError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      router.push(`/admin/sites/${site.id}/edit/domain`);
    } catch {
      setSaveError("Не вдалось підключитись до сервера");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-gray-600">{loadError}</p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-semibold text-gray-900 hover:underline"
        >
          ← На головну
        </Link>
      </div>
    );
  }

  if (!site || !template) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E6E6E6] bg-white px-6 py-3">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link
            href="/admin"
            aria-label="Назад до моїх сайтів"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <Link href="/admin" className="hover:text-gray-900">
            Мої сайти
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">{template.name}</span>
        </nav>

        <div className="flex items-center gap-3">
          {saveError && <p className="text-xs text-red-600">{saveError}</p>}
          <button
            type="button"
            onClick={handleProceed}
            disabled={saving}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            <SendIcon className="h-4 w-4" />
            {saving ? "Зберігаємо..." : "Обрати домен"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section
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
          <ContentForm fields={fields} values={content} onChange={updateField} />
        </aside>
      </div>
    </div>
  );
}
