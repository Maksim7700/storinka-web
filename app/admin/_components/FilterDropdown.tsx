"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "../../_components/icons";

type Option = { value: string; label: string };

type Props = {
  icon: ReactNode;
  label: string;
  value?: string;
  options?: Option[];
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const TRIGGER_BASE_CLASS =
  "flex h-10 items-center gap-2 rounded-full border border-[#E6E6E6] bg-white pl-3 pr-3 text-sm font-medium transition";

export default function FilterDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isInactive = disabled || !options || !onChange;

  // Close on outside click / Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isInactive) {
    return (
      <div
        className={`${TRIGGER_BASE_CLASS} cursor-not-allowed text-gray-400`}
        aria-disabled="true"
      >
        <span className="text-gray-400">{icon}</span>
        <span>{label}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
      </div>
    );
  }

  const currentLabel =
    value && options
      ? (options.find((o) => o.value === value)?.label ?? label)
      : label;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${TRIGGER_BASE_CLASS} cursor-pointer text-gray-700 hover:bg-gray-50 ${
          open ? "bg-gray-50" : ""
        }`}
      >
        <span className="text-gray-500">{icon}</span>
        <span>{currentLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-20 mt-2 min-w-full overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          {options!.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange!(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 whitespace-nowrap px-4 py-2 text-left text-sm transition ${
                    selected
                      ? "bg-neutral-900 font-semibold text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {o.label}
                  {selected && <CheckIcon className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
