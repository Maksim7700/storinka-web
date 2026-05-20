"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeftIcon,
  MonitorIcon,
  PhoneIcon,
  SendIcon,
} from "../../../_components/icons";
import { getTemplateComponent } from "../../../_components/templates/registry";
import type { TemplateForPreview } from "../page";

type Viewport = "desktop" | "mobile";

export default function PreviewClient({
  template,
}: {
  template: TemplateForPreview;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const Component = getTemplateComponent(template.key);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Toolbar
        templateKey={template.key}
        templateName={template.name}
        viewport={viewport}
        onViewportChange={setViewport}
      />

      <main className="flex-1 overflow-y-auto">
        {Component ? (
          viewport === "mobile" ? (
            <div className="flex justify-center py-10">
              <PhoneFrame>
                <Component />
              </PhoneFrame>
            </div>
          ) : (
            <div className="bg-white">
              <Component />
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center p-10 text-center text-sm text-gray-500">
            Для цього шаблону живий рендер ще не реалізовано.
          </div>
        )}
      </main>
    </div>
  );
}

type ToolbarProps = {
  templateKey: string;
  templateName: string;
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
};

function Toolbar({
  templateKey,
  templateName,
  viewport,
  onViewportChange,
}: ToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E6E6E6] bg-white pl-2 pr-0">
      <Link
        href={`/admin/catalog/${templateKey}`}
        aria-label="Назад"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>
      <span className="text-sm font-medium text-gray-900">{templateName}</span>

      <div className="mx-auto flex items-center gap-1 rounded-full border border-[#E6E6E6] bg-white p-1">
        <ViewportButton
          active={viewport === "desktop"}
          onClick={() => onViewportChange("desktop")}
          label="Desktop"
        >
          <MonitorIcon className="h-4 w-4" />
        </ViewportButton>
        <ViewportButton
          active={viewport === "mobile"}
          onClick={() => onViewportChange("mobile")}
          label="Mobile"
        >
          <PhoneIcon className="h-4 w-4" />
        </ViewportButton>
      </div>

      <Link
        href={`/admin/sites/new?template=${encodeURIComponent(templateKey)}`}
        className="flex h-14 items-center gap-2 bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        <SendIcon className="h-4 w-4" />
        Персоналізувати шаблон
      </Link>
    </header>
  );
}

function ViewportButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-7 w-9 items-center justify-center rounded-full transition ${
        active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  // CSS-only iPhone-style frame: 390×844 viewport inside a black bezel,
  // with a top notch and bottom home indicator.
  return (
    <div className="relative w-[392px] overflow-hidden rounded-[44px] border-[12px] border-black bg-black shadow-2xl">
      <div className="relative bg-white">
        {/* Status bar */}
        <div className="flex h-9 items-center justify-between bg-white px-7 text-[11px] font-semibold text-gray-900">
          <span>9:41</span>
          <div className="flex items-center gap-1 text-gray-700">
            <span className="text-[10px]">●●●●</span>
            <span className="text-[10px]">📶</span>
            <span className="text-[10px]">🔋</span>
          </div>
        </div>
        {/* Notch */}
        <div className="pointer-events-none absolute left-1/2 top-1.5 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />

        {/* Page viewport — vertically scrollable, fixed height */}
        <div className="h-[720px] overflow-y-auto">{children}</div>

        {/* Bottom home indicator */}
        <div className="flex justify-center bg-white py-2">
          <div className="h-1.5 w-32 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
