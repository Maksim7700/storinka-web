"use client";

import { INPUT_CLASS, LABEL_CLASS } from "../../../../_components/styles";
import type { TemplateField } from "../page";

type Props = {
  fields: TemplateField[];
  values: Record<string, string | number>;
  onChange: (key: string, value: string | number) => void;
};

export default function ContentForm({ fields, values, onChange }: Props) {
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
  onChange,
}: {
  field: TemplateField;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <div>
      <label htmlFor={field.key} className={LABEL_CLASS}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {renderControl(field, value, onChange)}
    </div>
  );
}

function renderControl(
  field: TemplateField,
  value: string | number,
  onChange: (v: string | number) => void,
) {
  switch (field.type) {
    case "color":
      return <ColorControl id={field.key} value={String(value || "#000000")} onChange={onChange} />;
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
          className={INPUT_CLASS}
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
          className={INPUT_CLASS}
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
  // Compound input: native color picker swatch on the left, editable hex text
  // on the right. Both sync to the same value.
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
