"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon } from "../../../../_components/icons";
import { getTemplateComponent } from "../../../../_components/templates/registry";
import ContentForm, {
  type TemplateField,
} from "../../_components/ContentForm";
import DeleteSiteModal from "./DeleteSiteModal";

const ROOT_DOMAIN = "storinka.ua";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

const STATUS_META: Record<SiteStatus, { label: string; className: string }> = {
  DRAFT: { label: "ЧЕРНЕТКА", className: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "АКТИВНО", className: "bg-green-100 text-green-700" },
  SUSPENDED: { label: "ЗАБЛОКОВАНО", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "ПРОСТРОЧЕНО", className: "bg-gray-200 text-gray-600" },
};

type Site = {
  id: number;
  subdomain: string;
  customDomain: string | null;
  status: SiteStatus;
  templateId: number;
  templateKey: string;
  templateName: string;
  templateThumbnailUrl: string | null;
  contentJson: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
};

type Template = {
  id: number;
  key: string;
  name: string;
  schemaJson: { fields?: TemplateField[] } | null;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SiteEditor({ siteId }: { siteId: number }) {
  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [content, setContent] = useState<Record<string, string | number>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Load site → then load its template (need schema_json for the form).
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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
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

        const templateRes = await fetch(
          `/api/templates/${encodeURIComponent(loadedSite.templateKey)}`,
        );
        if (!templateRes.ok) throw new Error(`HTTP ${templateRes.status}`);
        const loadedTemplate: Template = await templateRes.json();
        if (cancelled) return;

        setSite(loadedSite);
        setTemplate(loadedTemplate);
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
    if (saveState === "saved") setSaveState("idle");
  }

  async function handleSave() {
    if (!site) return;
    setSaveState("saving");
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
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      // Reset to idle after a short delay so the button label flips back.
      setTimeout(() => {
        setSaveState((s) => (s === "saved" ? "idle" : s));
      }, 2000);
    } catch {
      setSaveError("Не вдалось підключитись до сервера");
      setSaveState("error");
    }
  }

  async function handleTogglePublish() {
    if (!site) return;
    setPublishing(true);
    setPublishError(null);
    const action = site.status === "ACTIVE" ? "unpublish" : "publish";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${site.id}/${action}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setPublishError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      const updated: Site = await res.json();
      setSite(updated);
    } catch {
      setPublishError("Не вдалось підключитись до сервера");
    } finally {
      setPublishing(false);
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

  const status = STATUS_META[site.status];

  return (
    <div className="flex h-full flex-col">
      {/* Top toolbar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E6E6E6] bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            aria-label="Назад до моїх сайтів"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {site.templateName}
            </p>
            <p className="text-xs text-gray-500">
              {site.subdomain}.{ROOT_DOMAIN}
            </p>
          </div>
          <span
            className={`ml-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {publishError && (
            <p className="text-xs text-red-600">{publishError}</p>
          )}
          {saveState === "error" && saveError && (
            <p className="text-xs text-red-600">{saveError}</p>
          )}

          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Видалити
          </button>

          {(site.status === "DRAFT" || site.status === "ACTIVE") && (
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={publishing}
              className="flex h-10 items-center gap-2 rounded-[10px] border border-[#C8C8C8] bg-white px-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
            >
              {publishing
                ? "..."
                : site.status === "ACTIVE"
                  ? "Зняти з публікації"
                  : "Опублікувати"}
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="flex h-10 items-center gap-2 rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {saveState === "saving"
              ? "Зберігаємо..."
              : saveState === "saved"
                ? "Збережено ✓"
                : "Зберегти"}
          </button>
        </div>
      </header>

      {/* Split layout */}
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
          <ContentForm fields={fields} values={content} onChange={updateField} />
        </aside>
      </div>

      {deleteOpen && (
        <DeleteSiteModal
          siteId={site.id}
          subdomain={site.subdomain}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  );
}
