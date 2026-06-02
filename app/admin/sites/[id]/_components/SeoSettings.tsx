"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revalidateSite } from "../../../../_actions/revalidateSite";
import { ROOT_DOMAIN } from "../../../../_lib/constants";

type Props = {
  siteId: number;
  /** Used to build a deep link directly to this site's GSC property. */
  subdomain: string;
  initial: {
    gscVerification: string | null;
    gaMeasurementId: string | null;
  };
  /** Called with the persisted values so the parent can update its `site` state. */
  onSaved?: (values: {
    gscVerification: string | null;
    gaMeasurementId: string | null;
  }) => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SeoSettings({
  siteId,
  subdomain,
  initial,
  onSaved,
}: Props) {
  const router = useRouter();
  const [gsc, setGsc] = useState(initial.gscVerification ?? "");
  const [ga, setGa] = useState(initial.gaMeasurementId ?? "");
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Deep link straight to this site's GSC overview — saves the owner from
  // hunting through the property picker. `resource_id` is the URL-encoded
  // canonical URL of the site (URL-prefix property format).
  const gscDashboardUrl = `https://search.google.com/search-console?resource_id=${encodeURIComponent(
    `https://${subdomain}.${ROOT_DOMAIN}/`,
  )}`;
  // GA doesn't expose a deep link by site URL (it uses internal property IDs
  // we don't know without OAuth). The home page lists all properties so the
  // owner can pick theirs — still one click better than typing the URL.
  const gaDashboardUrl = "https://analytics.google.com/";

  const dirty =
    gsc !== (initial.gscVerification ?? "") ||
    ga !== (initial.gaMeasurementId ?? "");

  async function handleSave() {
    setState("saving");
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${siteId}/seo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          gscVerification: gsc.trim() || null,
          gaMeasurementId: ga.trim() || null,
        }),
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          body?.errors?.[0]?.defaultMessage ??
          body?.message ??
          `HTTP ${res.status}`;
        setError(msg);
        setState("error");
        return;
      }
      const saved = await res.json();
      onSaved?.({
        gscVerification: saved.gscVerification ?? null,
        gaMeasurementId: saved.gaMeasurementId ?? null,
      });
      // GSC verification meta tag and GA4 script are rendered into the
      // public page <head> by /s/[subdomain]/page.tsx — bust its cache so
      // a fresh "claim this property" verification doesn't sit behind a
      // stale 5min window.
      void revalidateSite(subdomain);
      setState("saved");
      setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      setError("Не вдалось підключитись до сервера");
      setState("error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Section intro */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          SEO & Аналітика
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Підключіть інструменти Google нижче. Самі дані (графіки, запити,
          відвідувачі) — на дашбордах Google, кнопки в кожній карточці
          відкривають їх напряму.
        </p>
      </div>

      {/* Google Search Console card */}
      <IntegrationCard
        title="Google Search Console"
        description="Показує які запити приводять людей на сайт, на яких позиціях ви в Google, і чи нема помилок індексації."
        connected={Boolean((initial.gscVerification ?? "").trim())}
        icon={<SearchIcon />}
      >
        <input
          id="gsc"
          type="text"
          value={gsc}
          onChange={(e) => setGsc(e.target.value)}
          placeholder="abc123XYZ..."
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full rounded-lg border border-[#C8C8C8] bg-white px-3 font-mono text-xs text-gray-900 placeholder:font-sans placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
        />
        <DashboardLink href={gscDashboardUrl}>
          Дивитись дані в Search Console
        </DashboardLink>
        <Disclosure label="Як отримати код?">
          <ol className="ml-4 list-decimal space-y-1.5 text-xs text-gray-600">
            <li>
              Відкрийте{" "}
              <ExternalLink href="https://search.google.com/search-console">
                Google Search Console
              </ExternalLink>
            </li>
            <li>
              <strong>Add property</strong> → <strong>URL prefix</strong>
            </li>
            <li>Введіть адресу свого сайту (наприклад test.storinka.ua)</li>
            <li>
              Оберіть метод <strong>HTML tag</strong>
            </li>
            <li>
              Скопіюйте значення з{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px]">
                content=&quot;...&quot;
              </code>{" "}
              і вставте сюди
            </li>
            <li>Збережіть → у GSC натисніть Verify</li>
          </ol>
        </Disclosure>
      </IntegrationCard>

      {/* Google Analytics card */}
      <IntegrationCard
        title="Google Analytics"
        description="Скільки людей зайшло, звідки прийшли, що дивились, скільки часу провели. Безкоштовна аналітика від Google."
        connected={Boolean((initial.gaMeasurementId ?? "").trim())}
        icon={<ChartIcon />}
      >
        <input
          id="ga"
          type="text"
          value={ga}
          onChange={(e) => setGa(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full rounded-lg border border-[#C8C8C8] bg-white px-3 font-mono text-xs text-gray-900 placeholder:font-sans placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
        />
        <DashboardLink href={gaDashboardUrl}>
          Дивитись дані в Analytics
        </DashboardLink>
        <Disclosure label="Як отримати ID?">
          <ol className="ml-4 list-decimal space-y-1.5 text-xs text-gray-600">
            <li>
              Відкрийте{" "}
              <ExternalLink href="https://analytics.google.com/">
                Google Analytics
              </ExternalLink>
            </li>
            <li>Створіть Property для свого сайту (якщо ще немає)</li>
            <li>
              <strong>Admin</strong> → <strong>Data Streams</strong> → виберіть
              ваш сайт
            </li>
            <li>
              Скопіюйте <strong>Measurement ID</strong> (починається з{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px]">
                G-
              </code>
              )
            </li>
          </ol>
        </Disclosure>
      </IntegrationCard>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || state === "saving"}
        className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "saving"
          ? "Зберігаємо..."
          : state === "saved"
            ? "Збережено ✓"
            : "Зберегти налаштування"}
      </button>
    </div>
  );
}

// --- subcomponents -------------------------------------------------------

function IntegrationCard({
  title,
  description,
  connected,
  icon,
  children,
}: {
  title: string;
  description: string;
  connected: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-[#E6E6E6] bg-white p-4">
      <header className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-gray-900">
              {title}
            </h4>
            <StatusBadge connected={connected} />
          </div>
          <p className="mt-1 text-xs leading-snug text-gray-500">
            {description}
          </p>
        </div>
      </header>
      <div className="space-y-3">{children}</div>
    </article>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        Підключено
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Не підключено
    </span>
  );
}

function DashboardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  // Prominent "view your data" CTA. Visually distinct from the inline help
  // links inside <Disclosure> — this one is THE action of the card after
  // the verification code is in place.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#E6E6E6] bg-white text-xs font-semibold text-gray-900 transition hover:border-neutral-900 hover:bg-gray-50"
    >
      <span>{children}</span>
      <ExternalIcon className="h-3 w-3" />
    </a>
  );
}

function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  // Native <details> gives us toggle-on-click + keyboard support for free.
  // Saves ~30 lines of state + animation code for this MVP.
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">
        <ChevronIcon className="h-3 w-3 transition group-open:rotate-90" />
        {label}
      </summary>
      <div className="mt-2.5 rounded-lg bg-gray-50 p-3">{children}</div>
    </details>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-gray-900 underline hover:no-underline"
    >
      {children}
    </a>
  );
}

// --- icons (inline so the card is self-contained) ------------------------

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" strokeLinecap="round" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 3v18h18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14l4-4 4 4 5-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M14 5h5v5M19 5l-9 9M19 14v5H5V5h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="m9 6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
