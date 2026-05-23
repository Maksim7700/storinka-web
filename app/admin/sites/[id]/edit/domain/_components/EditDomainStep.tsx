"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DomainFormSection, {
  type SubdomainStatus,
} from "../../../../_components/DomainFormSection";

type Site = {
  id: number;
  subdomain: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
};

export default function EditDomainStep({ siteId }: { siteId: number }) {
  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState<SubdomainStatus>("idle");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load the site once and seed the input with its current subdomain.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await fetch(`/api/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const loaded: Site = await res.json();
        if (cancelled) return;
        setSite(loaded);
        setSubdomain(loaded.subdomain);
        // Pre-existing subdomain is, by definition, the one the site already
        // owns — surface it as "available" so the user can proceed without
        // changes.
        setStatus("available");
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

  // Debounced availability check, but skip the check while the value matches
  // the site's current subdomain — that's always "available" to its owner.
  useEffect(() => {
    if (!site) return;
    if (!subdomain) {
      setStatus("idle");
      setReason("");
      return;
    }
    if (subdomain === site.subdomain) {
      setStatus("available");
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
  }, [subdomain, site]);

  async function handleProceed() {
    if (!site || status !== "available") return;

    // No change → skip the PATCH and go straight to the next step.
    if (subdomain === site.subdomain) {
      router.push(`/admin/sites/${site.id}/preview`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${site.id}/subdomain`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subdomain }),
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
              : "Не вдалось оновити піддомен"),
        );
        return;
      }
      router.push(`/admin/sites/${site.id}/preview`);
    } catch {
      setSubmitError("Не вдалось підключитись до сервера");
    } finally {
      setSubmitting(false);
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

  if (!site) {
    return (
      <div className="flex h-full items-center justify-center py-20 text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900">
          Мої сайти
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/admin/sites/${site.id}/edit`}
          className="hover:text-gray-900"
        >
          Редагування
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Обрати домен</span>
      </nav>

      <DomainFormSection
        subdomain={subdomain}
        onSubdomainChange={setSubdomain}
        status={status}
        reason={reason}
        currentSubdomain={site.subdomain}
        submitLabel="Використати"
        submittingLabel="Зберігаємо..."
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleProceed}
      />
    </div>
  );
}
