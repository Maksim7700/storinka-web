"use client";

import { useRef, useState } from "react";
import { INPUT_CLASS, LABEL_CLASS } from "../../../_components/styles";

export type TemplateFieldType =
  | "string"
  | "textarea"
  | "number"
  | "color"
  | "image"
  | "url"
  | "repeater";

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
  default?: unknown;
  /** Override the per-type default char limit (see DEFAULT_MAX_LENGTH below). */
  maxLength?: number;
  /** Key used to scroll the live preview when this field is focused.
   * Template renders a `[data-section="<previewAnchor>"]` somewhere; the editor
   * picks it up and scrolls. Falls back to the field's own `key`. */
  previewAnchor?: string;

  // ── repeater-only ───────────────────────────────────────────────────────
  /** Singular noun for the “+ Add” button label, e.g. "Проєкт". */
  itemLabel?: string;
  /** Field schema for each item in the repeater. */
  fields?: TemplateField[];
  /** Min / max items the user can have. */
  min?: number;
  max?: number;
};

// Hard caps so a malicious user can't paste 10M chars and bloat the JSONB row.
// Tune per type for realistic content; templates can override via TemplateField.maxLength.
const DEFAULT_MAX_LENGTH: Record<string, number> = {
  string: 200,
  textarea: 1000,
  image: 500,
  color: 7,
  url: 500,
};

function maxLengthFor(field: TemplateField): number | undefined {
  if (field.maxLength) return field.maxLength;
  if (field.type === "number") return undefined;
  if (field.type === "repeater") return undefined;
  return DEFAULT_MAX_LENGTH[field.type] ?? 200;
}

function isEmptyScalar(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim().length === 0;
  if (typeof v === "number") return Number.isNaN(v);
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/** Validates required fields; returns a key→message map of failures (empty map = valid).
 * Repeater fields are considered missing when the array is empty. We don't dive into
 * inner item validation here — that would surface "ghost" errors for items the user
 * hasn't started filling. Keep it shallow for now.
 */
export function validateRequired(
  fields: TemplateField[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (!f.required) continue;
    if (isEmptyScalar(values[f.key])) {
      errors[f.key] = `Заповніть «${f.label}»`;
    }
  }
  return errors;
}

type Props = {
  fields: TemplateField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  /** Map of fieldKey → error message — highlights field red and shows the text below. */
  errors?: Record<string, string>;
  /** Fires with the preview anchor (or field.key) when ANY input inside this
   * form gets focus. Editor wires this to scroll the live preview. */
  onFieldFocus?: (anchorKey: string) => void;
};

export default function ContentForm({
  fields,
  values,
  onChange,
  errors,
  onFieldFocus,
}: Props) {
  if (fields.length === 0) {
    return (
      <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
        У цього шаблону поки немає налаштовуваних полів.
      </p>
    );
  }

  // Repeaters are visually heavy — pull them into their own sections under the
  // flat "Загальне" block so the form reads top→bottom without long jumps.
  const flat = fields.filter((f) => f.type !== "repeater");
  const repeaters = fields.filter((f) => f.type === "repeater");

  // Delegated focus capture: any input that bubbles a focus event up through
  // here is looked up via its nearest [data-field-key] ancestor. Cheaper than
  // wiring onFocus on every leaf <input>.
  function handleFocusCapture(e: React.FocusEvent<HTMLDivElement>) {
    if (!onFieldFocus) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-field-key]",
    );
    if (!el) return;
    const k = el.dataset.fieldKey;
    if (k) onFieldFocus(k);
  }

  return (
    <div className="space-y-8" onFocusCapture={handleFocusCapture}>
      {flat.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Загальне</h3>
          <div className="space-y-4">
            {flat.map((f) => (
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
      )}

      {repeaters.map((f) => (
        <section
          key={f.key}
          data-field-key={f.previewAnchor ?? f.key}
        >
          <h3 className="mb-4 text-sm font-semibold text-gray-900">{f.label}</h3>
          <RepeaterControl
            field={f}
            value={values[f.key]}
            onChange={(v) => onChange(f.key, v)}
            error={errors?.[f.key]}
          />
          {errors?.[f.key] && (
            <p className="mt-2 text-xs text-red-600">{errors[f.key]}</p>
          )}
        </section>
      ))}
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
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
}) {
  return (
    <div data-field-key={field.previewAnchor ?? field.key}>
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
  value: unknown,
  onChange: (v: unknown) => void,
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
          value={value === "" || value === undefined || value === null ? "" : Number(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder={field.placeholder}
          className={inputCls}
        />
      );
    case "url":
      return (
        <input
          id={field.key}
          type="url"
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "https://..."}
          maxLength={max}
          className={inputCls}
        />
      );
    case "repeater":
      // Repeaters are rendered standalone by ContentForm — never via FieldRow.
      return null;
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
  onChange: (v: unknown) => void;
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
  onChange: (v: unknown) => void;
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

// ── repeater ────────────────────────────────────────────────────────────────

type RepeaterItem = Record<string, unknown>;

function asItems(value: unknown): RepeaterItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is RepeaterItem => typeof v === "object" && v !== null && !Array.isArray(v),
  );
}

function RepeaterControl({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const items = asItems(value);
  const subFields = field.fields ?? [];
  const itemLabel = field.itemLabel ?? "Елемент";
  const max = field.max;
  const min = field.min ?? 0;

  function updateItem(idx: number, key: string, v: unknown) {
    const next = items.map((it, i) => (i === idx ? { ...it, [key]: v } : it));
    onChange(next);
  }

  function addItem() {
    if (max !== undefined && items.length >= max) return;
    // Seed each sub-field with a sensible empty value so React inputs stay controlled.
    const seed: RepeaterItem = {};
    for (const sf of subFields) {
      seed[sf.key] = sf.type === "number" ? 0 : "";
    }
    onChange([...items, seed]);
  }

  function removeItem(idx: number) {
    if (items.length <= min) return;
    onChange(items.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, delta: number) {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-md border border-dashed border-[#C8C8C8] bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
          Поки немає елементів. Натисніть «Додати» нижче.
        </p>
      )}

      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-[12px] border border-[#E6E6E6] bg-white p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {itemLabel} {idx + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                aria-label="Вгору"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveItem(idx, 1)}
                disabled={idx === items.length - 1}
                aria-label="Вниз"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                disabled={items.length <= min}
                className="ml-1 h-7 cursor-pointer rounded px-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Видалити
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {subFields.map((sf) => (
              <FieldRow
                key={sf.key}
                field={sf}
                value={item[sf.key] ?? ""}
                onChange={(v) => updateItem(idx, sf.key, v)}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        disabled={max !== undefined && items.length >= max}
        className="w-full cursor-pointer rounded-[10px] border border-dashed border-gray-400 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:border-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Додати {itemLabel.toLowerCase()}
        {max !== undefined && (
          <span className="ml-2 text-xs font-normal text-gray-400">
            ({items.length} / {max})
          </span>
        )}
      </button>
    </div>
  );
}
