"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BTN_SECONDARY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from "../../../../_components/styles";

const ROOT_DOMAIN = "storinka.ua";

type Props = {
  siteId: number;
  subdomain: string;
  onClose: () => void;
};

export default function DeleteSiteModal({ siteId, subdomain, onClose }: Props) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = confirmation === subdomain;

  // Esc closes the modal.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDelete() {
    if (!matches) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      router.push("/admin");
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
          <h2 className="text-xl font-bold text-gray-900">Видалити сайт?</h2>
          <p className="mt-1 text-sm text-gray-500">
            Цю дію не можна скасувати. Сайт буде остаточно видалено разом з усім
            контентом.
          </p>
        </div>

        <label htmlFor="confirm-subdomain" className={LABEL_CLASS}>
          Введіть{" "}
          <span className="font-mono text-gray-900">{subdomain}</span> для
          підтвердження
        </label>
        <input
          id="confirm-subdomain"
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={subdomain}
          autoComplete="off"
          autoFocus
          className={INPUT_CLASS}
        />
        <p className="mt-2 text-xs text-gray-400">
          Адреса сайту: {subdomain}.{ROOT_DOMAIN}
        </p>

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
            onClick={handleDelete}
            disabled={!matches || submitting}
            className="flex h-12 w-full items-center justify-center rounded-[10px] bg-red-600 px-4 text-base font-semibold leading-[1.4] tracking-[0.02em] text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? "Видаляємо..." : "Видалити назавжди"}
          </button>
        </div>
      </div>
    </div>
  );
}
