"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CopyIcon,
  MoreIcon,
  SendIcon,
  SettingsIcon,
  TrashIcon,
} from "../../_components/icons";
import { ROOT_DOMAIN } from "../../_lib/constants";
import DeleteSiteModal from "./DeleteSiteModal";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";

const STATUS_META: Record<SiteStatus, { label: string; className: string }> = {
  DRAFT: { label: "ЧЕРНЕТКА", className: "bg-gray-200 text-gray-700" },
  ACTIVE: { label: "АКТИВНО", className: "bg-green-500 text-white" },
  SUSPENDED: { label: "ПРИЗУПИНЕНО", className: "bg-amber-500 text-white" },
  INACTIVE: { label: "НЕАКТИВНО", className: "bg-gray-300 text-gray-700" },
};

const numberFormat = new Intl.NumberFormat("uk-UA");
const dateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function nextPaymentDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setMonth(d.getMonth() + 1);
  return dateFormat.format(d);
}

export type SiteSummary = {
  id: number;
  subdomain: string;
  status: SiteStatus;
  templateId: number;
  templateKey: string;
  templateName: string;
  templateDescription: string | null;
  templateCategory: string | null;
  templateThumbnailUrl: string | null;
  licensePrice: number;
  monthlyPrice: number;
  createdAt: string;
  updatedAt: string;
};

export default function SiteCard({
  site,
  onDeleted,
}: {
  site: SiteSummary;
  /** Called after a successful delete. Parent removes the card from its list. */
  onDeleted?: (siteId: number) => void;
}) {
  const status = STATUS_META[site.status] ?? STATUS_META.DRAFT;
  const isActive = site.status === "ACTIVE";
  const liveUrl = `https://${site.subdomain}.${ROOT_DOMAIN}`;
  // Огляд is always the same destination — a single "site overview" page.
  // That page adapts its primary action to the current status (pay, resume,
  // open live, etc.), so the card-level UX stays predictable.
  const ogliadHref = `/admin/sites/${site.id}/preview`;

  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <article className="flex flex-col rounded-[20px] border border-[#E6E6E6] bg-white">
      <div className="aspect-[16/10] overflow-hidden rounded-t-[20px] bg-gray-100">
        {site.templateThumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={site.templateThumbnailUrl}
            alt={site.templateName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Немає прев&apos;ю
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Price + next payment, vertical divider between, horizontal divider below */}
        <div className="grid grid-cols-2 border-b border-[#E6E6E6] pb-4">
          <div className="border-r border-[#E6E6E6] pr-4">
            <p className="text-xl font-medium text-gray-900">
              {numberFormat.format(site.monthlyPrice)} грн/міс
            </p>
            <p className="mt-1 text-xs text-gray-500">Щомісячний платіж</p>
          </div>
          <div className="pl-4">
            <p className="text-xl font-medium text-gray-900">
              {isActive ? nextPaymentDate(site.createdAt) : "—"}
            </p>
            <p className="mt-1 text-xs text-gray-500">Наступна оплата</p>
          </div>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-semibold text-gray-900">{site.templateName}</h3>
          {site.templateDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {site.templateDescription}
            </p>
          )}
        </div>

        {/* Status badge + domain */}
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
          <span className="truncate text-sm italic text-gray-500">
            {site.subdomain}.{ROOT_DOMAIN}
          </span>
        </div>

        {/* Bottom action row */}
        <div className="mt-auto flex items-center gap-3">
          <CardMenu
            liveUrl={liveUrl}
            settingsHref={
              site.status === "DRAFT"
                ? `/admin/sites/${site.id}/edit`
                : `/admin/sites/${site.id}`
            }
            onDelete={() => setDeleteOpen(true)}
          />
          <Link
            href={ogliadHref}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <SendIcon className="h-4 w-4" />
            Огляд
          </Link>
        </div>
      </div>

      {deleteOpen && (
        <DeleteSiteModal
          siteId={site.id}
          subdomain={site.subdomain}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            setDeleteOpen(false);
            onDeleted?.(site.id);
          }}
        />
      )}
    </article>
  );
}

function CardMenu({
  liveUrl,
  settingsHref,
  onDelete,
}: {
  liveUrl: string;
  settingsHref: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Меню сайту"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-[12px] border-2 border-[#1D1D1D] bg-white text-gray-900 transition hover:bg-gray-100"
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 min-w-max overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full cursor-pointer items-center gap-3 whitespace-nowrap px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              <CopyIcon className="h-4 w-4 text-gray-700" />
            </span>
            {copied ? "Скопійовано ✓" : "Копіювати посилання"}
          </button>
          <Link
            href={settingsHref}
            role="menuitem"
            className="flex w-full items-center gap-3 whitespace-nowrap px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              <SettingsIcon className="h-4 w-4 text-gray-700" />
            </span>
            Налаштування
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full cursor-pointer items-center gap-3 whitespace-nowrap px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              <TrashIcon className="h-4 w-4 text-red-600" />
            </span>
            Видалити
          </button>
        </div>
      )}
    </div>
  );
}
