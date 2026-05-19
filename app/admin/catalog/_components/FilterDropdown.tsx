"use client";

import type { ReactNode } from "react";

type Option = { value: string; label: string };

type Props = {
  icon: ReactNode;
  label: string;
  value?: string;
  options?: Option[];
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function FilterDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  disabled,
}: Props) {
  const isInactive = disabled || !options || !onChange;

  const baseClass =
    "flex h-10 items-center gap-2 rounded-full border border-[#E6E6E6] bg-white pl-3 pr-3 text-sm font-medium transition";

  if (isInactive) {
    return (
      <div
        className={`${baseClass} cursor-not-allowed text-gray-400`}
        aria-disabled="true"
      >
        <span className="text-gray-400">{icon}</span>
        <span>{label}</span>
        <ChevronDownIcon />
      </div>
    );
  }

  // Hide the native chevron by stretching the <select> over the button area.
  // The custom icon + label sit on top via absolute positioning.
  return (
    <label className={`${baseClass} relative cursor-pointer text-gray-700 hover:bg-gray-50`}>
      <span className="text-gray-500">{icon}</span>
      <span>
        {value && options
          ? (options.find((o) => o.value === value)?.label ?? label)
          : label}
      </span>
      <ChevronDownIcon />
      <select
        value={value}
        onChange={(e) => onChange!(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options!.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
