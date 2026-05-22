"use client";

import { ROOT_DOMAIN } from "../../../_lib/constants";

export type SubdomainStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "unavailable";

type Props = {
  subdomain: string;
  onSubdomainChange: (value: string) => void;
  status: SubdomainStatus;
  reason: string;
  /** If provided and the typed value matches it, show the "current" hint and
   *  treat the subdomain as already-available. Used by the edit flow. */
  currentSubdomain?: string;
  submitLabel: string;
  /** Label while the submit is in flight. Defaults to "Зберігаємо...". */
  submittingLabel?: string;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
};

export default function DomainFormSection({
  subdomain,
  onSubdomainChange,
  status,
  reason,
  currentSubdomain,
  submitLabel,
  submittingLabel = "Зберігаємо...",
  submitting,
  submitError,
  onSubmit,
}: Props) {
  function normalize(raw: string) {
    return raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
  }

  const previewSubdomain = subdomain || "ваш-сайт";
  const canSubmit = status === "available" && !submitting;

  return (
    <>
      <section className="relative rounded-[20px] border border-[#E6E6E6] bg-white px-8 py-12">
        <span className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          Безплатно
        </span>
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Обрати домен
        </h1>

        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-[#C8C8C8] bg-white pl-4">
            <input
              type="text"
              value={subdomain}
              onChange={(e) => onSubdomainChange(normalize(e.target.value))}
              placeholder="lumina"
              autoComplete="off"
              autoFocus
              className="h-12 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </span>
          </div>
          <span className="rounded-[10px] border border-[#C8C8C8] bg-white px-4 py-3 text-sm text-gray-500">
            .{ROOT_DOMAIN}
          </span>
        </div>

        <StatusHint
          subdomain={subdomain}
          currentSubdomain={currentSubdomain}
          status={status}
          reason={reason}
        />
      </section>

      <section className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-[#E6E6E6] bg-white px-8 py-5">
        <p className="text-sm font-medium text-gray-900">
          {previewSubdomain}.{ROOT_DOMAIN}
        </p>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex h-12 cursor-pointer items-center rounded-[10px] bg-neutral-900 px-8 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </section>

      {submitError && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {submitError}
        </p>
      )}

      <section className="mt-6 rounded-[20px] border border-[#E6E6E6] bg-[#FAFAFA] px-8 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Чому використовується піддомен &quot;.{ROOT_DOMAIN}&quot;?
            </h2>
            <p className="mt-2 text-xs text-gray-600">
              Ми зробили це спеціально, щоб ви могли отримати повністю робочий
              сайт <span className="font-semibold">за 1 хвилину</span> без жодних
              налаштувань.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-gray-700">
            <Bullet>
              <strong>Миттєвий старт</strong> — без налаштувань DNS і чекання
            </Bullet>
            <Bullet>
              <strong>Мінімум витрат</strong> — сайт готовий за 1 хвилину
            </Bullet>
            <Bullet>
              <strong>Налаштування безпеки</strong> — SSL-сертифікат вже працює
            </Bullet>
            <Bullet>
              <strong>Ніяких технічних заморочок</strong> — робимо все ми
            </Bullet>
          </ul>
        </div>
      </section>

      <p className="mt-3 text-right text-xs italic text-gray-400">
        Підключення власного домену з&apos;явиться вже найближчим часом
      </p>
    </>
  );
}

function StatusHint({
  subdomain,
  currentSubdomain,
  status,
  reason,
}: {
  subdomain: string;
  currentSubdomain?: string;
  status: SubdomainStatus;
  reason: string;
}) {
  if (!subdomain || status === "idle") {
    return (
      <p className="mt-4 text-center text-xs text-gray-400">
        3–63 символи: лише a-z, 0-9 та дефіс
      </p>
    );
  }
  if (currentSubdomain && subdomain === currentSubdomain) {
    return (
      <p className="mt-4 text-center text-xs text-gray-500">
        Поточний піддомен сайту
      </p>
    );
  }
  if (status === "checking") {
    return (
      <p className="mt-4 text-center text-xs text-gray-500">Перевіряємо...</p>
    );
  }
  if (status === "available") {
    return (
      <p className="mt-4 text-center text-xs text-green-600">
        ✓ Піддомен доступний
      </p>
    );
  }
  return <p className="mt-4 text-center text-xs text-red-600">✗ {reason}</p>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
      <span>{children}</span>
    </li>
  );
}
