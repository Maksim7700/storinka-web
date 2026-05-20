"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from "../../../../_components/styles";

const ROOT_DOMAIN = "storinka.ua";

type SubdomainStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "unavailable";

type Props = {
  templateId: number;
  content: Record<string, string | number>;
  onClose: () => void;
};

export default function DomainModal({ templateId, content, onClose }: Props) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState<SubdomainStatus>("idle");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc closes the modal.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  function normalize(raw: string) {
    return raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 409) {
          setError(body?.message ?? "Піддомен уже зайнятий");
        } else if (res.status === 400) {
          setError(body?.message ?? "Невірно заповнені поля");
        } else if (res.status === 401) {
          router.replace("/login");
          return;
        } else {
          setError("Не вдалось створити сайт. Спробуйте пізніше");
        }
        return;
      }
      router.push("/admin?created=true");
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={wrapperRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-2xl"
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Оберіть піддомен</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ваш сайт буде доступний за адресою{" "}
            <span className="font-medium text-gray-900">
              {subdomain || "ваш-сайт"}.{ROOT_DOMAIN}
            </span>
          </p>
        </div>

        <label htmlFor="modal-subdomain" className={LABEL_CLASS}>
          Піддомен
        </label>
        <div className="flex">
          <input
            id="modal-subdomain"
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(normalize(e.target.value))}
            placeholder="my-biz"
            autoComplete="off"
            autoFocus
            className={`${INPUT_CLASS} rounded-r-none`}
          />
          <span className="flex items-center rounded-r-[10px] border border-l-0 border-[#C8C8C8] bg-gray-50 px-3 text-sm text-gray-500">
            .{ROOT_DOMAIN}
          </span>
        </div>
        <StatusLine subdomain={subdomain} status={status} reason={reason} />

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={BTN_SECONDARY_CLASS}
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status !== "available" || submitting}
            className={BTN_PRIMARY_CLASS}
          >
            {submitting ? "Зберігаємо..." : "Створити сайт"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusLine({
  subdomain,
  status,
  reason,
}: {
  subdomain: string;
  status: SubdomainStatus;
  reason: string;
}) {
  if (!subdomain || status === "idle") {
    return <p className="mt-2 text-xs text-gray-400">3–63 символи, тільки a-z, 0-9, дефіс</p>;
  }
  if (status === "checking") {
    return <p className="mt-2 text-xs text-gray-500">Перевіряємо...</p>;
  }
  if (status === "available") {
    return (
      <p className="mt-2 text-xs text-green-600">
        ✓ {subdomain}.{ROOT_DOMAIN} — доступний
      </p>
    );
  }
  return <p className="mt-2 text-xs text-red-600">✗ {reason}</p>;
}
