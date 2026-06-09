"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearDraft, loadDraft } from "../../../../../_lib/draftState";
import DomainFormSection, {
  type SubdomainStatus,
} from "../../../_components/DomainFormSection";

export default function DomainPicker({
  templateKey,
}: {
  templateKey: string;
}) {
  const router = useRouter();

  const [draftReady, setDraftReady] = useState<boolean | null>(null);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [content, setContent] = useState<Record<string, unknown>>({});

  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState<SubdomainStatus>("idle");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Read the draft once, redirect if missing.
  useEffect(() => {
    const draft = loadDraft();
    if (!draft || draft.templateKey !== templateKey) {
      router.replace(`/admin/catalog/${encodeURIComponent(templateKey)}`);
      return;
    }
    setTemplateId(draft.templateId);
    setContent(draft.content);
    setDraftReady(true);
  }, [templateKey, router]);

  // Debounced subdomain availability check.
  useEffect(() => {
    if (!subdomain) {
      setStatus("idle");
      setReason("");
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(subdomain)) {
      setStatus("invalid");
      setReason("Тільки a-z, 0-9, дефіс; 3–63 символи");
      return;
    }
    setStatus("checking");
    const timeoutId = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/sites/check-subdomain?value=${encodeURIComponent(subdomain)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        if (!res.ok) {
          setStatus("idle");
          return;
        }
        const data: { available: boolean; reason: string } = await res.json();
        setStatus(data.available ? "available" : "unavailable");
        setReason(data.reason);
      } catch {
        setStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [subdomain]);

  async function handleUse() {
    if (status !== "available" || !templateId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          templateId,
          subdomain,
          contentJson: content,
        }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setSubmitError(
          body?.message ??
            (res.status === 409
              ? "Піддомен уже зайнятий"
              : "Не вдалось створити сайт"),
        );
        return;
      }
      const site: { id: number } = await res.json();
      clearDraft();
      router.push(`/admin/sites/${site.id}/preview`);
    } catch {
      setSubmitError("Не вдалось підключитись до сервера");
    } finally {
      setSubmitting(false);
    }
  }

  if (draftReady === null) {
    return null; // Brief gating while the draft is being read.
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/admin/catalog" className="hover:text-gray-900">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/admin/sites/new?template=${encodeURIComponent(templateKey)}`}
          className="hover:text-gray-900"
        >
          Налаштування
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Обрати домен</span>
      </nav>

      <DomainFormSection
        subdomain={subdomain}
        onSubdomainChange={setSubdomain}
        status={status}
        reason={reason}
        submitLabel="Використати"
        submittingLabel="Створюємо..."
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleUse}
      />
    </div>
  );
}
