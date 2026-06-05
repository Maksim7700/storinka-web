"use client";

import { useRef, useState } from "react";
import { INPUT_CLASS, LABEL_CLASS } from "../../../_components/styles";

export type TemplateField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  default?: string | number;
  /** Override the per-type default char limit (see DEFAULT_MAX_LENGTH below). */
  maxLength?: number;
};

// Hard caps so a malicious user can't paste 10M chars and bloat the JSONB row.
// Tune per type for realistic content; templates can override via TemplateField.maxLength.
const DEFAULT_MAX_LENGTH: Record<string, number> = {
  string: 200,
  textarea: 1000,
  image: 500,
  color: 7,
};

function maxLengthFor(field: TemplateField): number | undefined {
  if (field.maxLength) return field.maxLength;
  if (field.type === "number") return undefined;
  return DEFAULT_MAX_LENGTH[field.type] ?? 200;
}

/** Validates required fields; returns a key→message map of failures (empty map = valid). */
export function validateRequired(
  fields: TemplateField[],
  values: Record<string, string | number>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (!f.required) continue;
    const v = values[f.key];
    const isEmpty =
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim().length === 0) ||
      (typeof v === "number" && Number.isNaN(v));
    if (isEmpty) {
      errors[f.key] = `Заповніть «${f.label}»`;
    }
  }
  return errors;
}

type Props = {
  fields: TemplateField[];
  values: Record<string, string | number>;
  onChange: (key: string, value: string | number) => void;
  /** Map of fieldKey → error message — highlights field red and shows the text below. */
  errors?: Record<string, string>;
};

export default function ContentForm({ fields, values, onChange, errors }: Props) {
  if (fields.length === 0) {
    return (
      <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
        У цього шаблону поки немає налаштовуваних полів.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Загальне</h3>
        <div className="space-y-4">
          {fields.map((f) => (
            <FieldRow
              key={f.key}
              field={f}
              value={values[f.key] ?? ""}
              error={errors?.[f.key]}
              onChange={(v) => onChange(f.key, v)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function FieldRow({
  field,
  value,
  error,
  onChange,
}: {
  field: TemplateField;
  value: string | number;
  error?: string;
  onChange: (v: string | number) => void;
}) {
  return (
    <div>
      <label htmlFor={field.key} className={LABEL_CLASS}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {renderControl(field, value, onChange, Boolean(error))}
      {field.key === "description" && (
        <DescriptionCounter value={String(value || "")} />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function DescriptionCounter({ value }: { value: string }) {
  const len = value.length;
  const tier =
    len === 0
      ? { color: "text-gray-400", suffix: " (рекомендовано 120-160)" }
      : len < 120
        ? { color: "text-gray-500", suffix: ` — ще ${120 - len} для оптимуму` }
        : len <= 160
          ? { color: "text-green-600", suffix: " — оптимально" }
          : { color: "text-amber-600", suffix: ` — Google обріже після 160` };
  return (
    <p className={`mt-1 text-xs ${tier.color}`}>
      {len} / 160{tier.suffix}
    </p>
  );
}

function renderControl(
  field: TemplateField,
  value: string | number,
  onChange: (v: string | number) => void,
  invalid: boolean,
) {
  // Append red border when the field has a validation error.
  const inputCls = invalid
    ? `${INPUT_CLASS} !border-red-500 focus:!border-red-500`
    : INPUT_CLASS;
  const max = maxLengthFor(field);
  switch (field.type) {
    case "color":
      return (
        <ColorControl
          id={field.key}
          value={String(value || "#000000")}
          onChange={onChange}
        />
      );
    case "image":
      return (
        <ImageControl
          id={field.key}
          value={String(value || "")}
          onChange={onChange}
        />
      );
    case "textarea":
      // INPUT_CLASS not reused — its fixed h-12 conflicts with textarea's h-auto.
      return (
        <textarea
          id={field.key}
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Введіть текст"}
          rows={3}
          maxLength={max}
          className={`w-full resize-y rounded-[10px] border bg-white px-4 py-3 text-sm leading-snug placeholder:text-gray-400 focus:outline-none ${
            invalid
              ? "border-red-500 focus:border-red-500"
              : "border-[#C8C8C8] focus:border-gray-900"
          }`}
        />
      );
    case "number":
      return (
        <input
          id={field.key}
          type="number"
          value={value === "" ? "" : Number(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder={field.placeholder}
          className={inputCls}
        />
      );
    case "string":
    default:
      return (
        <input
          id={field.key}
          type="text"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Введіть текст"}
          maxLength={max}
          className={inputCls}
        />
      );
  }
}

function ColorControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Compound: color picker swatch + editable hex text, both sync to one value.
  return (
    <div className="flex h-12 items-center gap-3 rounded-[10px] border border-[#C8C8C8] bg-white px-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Виберіть колір"
        className="h-7 w-7 cursor-pointer rounded border border-[#E6E6E6] bg-white"
      />
      <input
        id={id}
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm uppercase text-gray-900 outline-none"
        placeholder="#000000"
      />
    </div>
  );
}

function ImageControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      // Backend rejects unauthenticated POSTs with 401.
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/files", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) {
        if (res.status === 401) setError("Спочатку увійдіть в акаунт");
        else if (res.status === 400) setError("Невірний файл (макс. 5 МБ, JPG/PNG/WebP/GIF)");
        else setError("Не вдалось завантажити файл");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data?.url) onChange(data.url);
      else setError("Сервер не повернув URL файлу");
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // Reset so selecting the same file twice still fires onChange.
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Превʼю"
            className="h-24 w-24 rounded-[10px] border border-[#C8C8C8] object-cover"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="h-9 cursor-pointer rounded-[10px] border border-[#C8C8C8] bg-white px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Завантаження..." : "Замінити фото"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="h-9 cursor-pointer rounded-[10px] border border-[#C8C8C8] bg-white px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Видалити
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#C8C8C8] bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Завантаження..." : "Завантажити фото (макс. 5 МБ)"}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
