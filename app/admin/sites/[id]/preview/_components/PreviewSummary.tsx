"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckIcon,
  FileIcon,
  MonitorIcon,
  PhoneIcon,
  SignalIcon,
} from "../../../../../_components/icons";
import {
  getTemplateComponent,
  getTemplateMeta,
} from "../../../../../_components/templates/registry";
import { ROOT_DOMAIN } from "../../../../../_lib/constants";

type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
type Viewport = "desktop" | "mobile";

type Site = {
  id: number;
  subdomain: string;
  status: SiteStatus;
  templateKey: string;
  templateName: string;
  templateThumbnailUrl: string | null;
  contentJson: Record<string, unknown>;
};

type Template = {
  licensePrice: number;
  monthlyPrice: number;
  // schemaJson is still on the wire but unused — features/tags come from the
  // code-side registry instead.
};

const numberFormat = new Intl.NumberFormat("uk-UA");

export default function PreviewSummary({ siteId }: { siteId: number }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const siteRes = await fetch(`/api/sites/${siteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (siteRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (!siteRes.ok) throw new Error(`HTTP ${siteRes.status}`);
        const loadedSite: Site = await siteRes.json();
        if (cancelled) return;
        setSite(loadedSite);

        const tplRes = await fetch(
          `/api/templates/${encodeURIComponent(loadedSite.templateKey)}`,
        );
        if (!tplRes.ok) throw new Error(`HTTP ${tplRes.status}`);
        const loadedTpl: Template = await tplRes.json();
        if (!cancelled) setTemplate(loadedTpl);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Помилка завантаження");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [siteId, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-gray-600">{error}</p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-semibold text-gray-900 hover:underline"
        >
          ← На головну
        </Link>
      </div>
    );
  }

  if (!site || !template) {
    return (
      <div className="flex h-full items-center justify-center py-20 text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  const Component = getTemplateComponent(site.templateKey);
  const features = getTemplateMeta(site.templateKey)?.features ?? [];
  const brandName =
    (typeof site.contentJson?.businessName === "string" &&
      site.contentJson.businessName) ||
    site.templateName;

  return (
    <div className="px-16 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/admin/catalog" className="hover:text-gray-900">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin" className="hover:text-gray-900">
          Мої сайти
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PreviewMockup
            Component={Component}
            content={site.contentJson}
            thumbnail={site.templateThumbnailUrl}
            viewport={viewport}
            onViewportChange={setViewport}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-[20px] border border-[#E6E6E6] bg-white p-6">
            <div className="grid grid-cols-2 gap-4 pb-5">
              <PriceCell
                amount={`${numberFormat.format(template.licensePrice)} грн`}
                label="Разовий платіж"
              />
              <PriceCell
                amount={`${numberFormat.format(template.monthlyPrice)} грн/міс`}
                label="Щомісячний платіж"
              />
            </div>

            <div className="border-t border-[#E6E6E6] pt-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-gray-900">{brandName}</h2>
                <StatusBadge status={site.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {site.subdomain}.{ROOT_DOMAIN}
              </p>
            </div>

            {features.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-700">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FeatureIcon name={f.icon} />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <PrimaryAction
                site={site}
                onSiteUpdate={setSite}
              />
            </div>
          </section>

          <InfoCard status={site.status} />
        </div>
      </div>
    </div>
  );
}

function PreviewMockup({
  Component,
  content,
  thumbnail,
  viewport,
  onViewportChange,
}: {
  Component: ReturnType<typeof getTemplateComponent>;
  content: Record<string, unknown>;
  thumbnail: string | null;
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-[20px] ring-1 ring-inset ring-gray-200"
      style={{
        backgroundColor: "#F7F8FA",
        backgroundImage:
          "radial-gradient(circle, #D4D7DD 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="flex justify-center pt-6">
        <ViewportToggle value={viewport} onChange={onViewportChange} />
      </div>
      <div className="flex justify-center px-8 pb-8 pt-6">
        {viewport === "desktop" ? (
          <DesktopFrame
            Component={Component}
            content={content}
            thumbnail={thumbnail}
          />
        ) : (
          <MobileFrame
            Component={Component}
            content={content}
            thumbnail={thumbnail}
          />
        )}
      </div>
    </div>
  );
}

function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport;
  onChange: (v: Viewport) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Перегляд"
      className="flex items-center gap-1 rounded-full border border-[#E6E6E6] bg-white p-1"
    >
      <ViewportButton
        active={value === "desktop"}
        onClick={() => onChange("desktop")}
        label="Desktop"
      >
        <MonitorIcon className="h-4 w-4" />
      </ViewportButton>
      <ViewportButton
        active={value === "mobile"}
        onClick={() => onChange("mobile")}
        label="Mobile"
      >
        <PhoneIcon className="h-4 w-4" />
      </ViewportButton>
    </div>
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
      role="tab"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-10 cursor-pointer items-center justify-center rounded-full transition ${
        active
          ? "bg-neutral-900 text-white"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function DesktopFrame({
  Component,
  content,
  thumbnail,
}: {
  Component: ReturnType<typeof getTemplateComponent>;
  content: Record<string, unknown>;
  thumbnail: string | null;
}) {
  return (
    <div className="relative h-[560px] w-full max-w-[820px] overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-black/5">
      <div className="flex h-6 items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-3">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-green-400" />
      </div>
      <div className="h-[534px] overflow-y-auto">
        {/* `zoom` (not `transform: scale`) so the scaled content's layout
            actually shrinks — otherwise the inner box stays at natural size
            and the scrollbar measures unscaled height. */}
        <div style={{ zoom: 0.64 }}>
          {Component ? (
            <Component content={content} />
          ) : (
            <ThumbnailFallback url={thumbnail} />
          )}
        </div>
      </div>
    </div>
  );
}

function MobileFrame({
  Component,
  content,
  thumbnail,
}: {
  Component: ReturnType<typeof getTemplateComponent>;
  content: Record<string, unknown>;
  thumbnail: string | null;
}) {
  return (
    <div className="relative h-[560px] w-[270px] overflow-hidden rounded-[40px] border-[8px] border-black bg-black shadow-xl">
      <div className="relative flex h-full flex-col bg-white">
        {/* Status bar */}
        <div className="relative flex h-8 shrink-0 items-center justify-between px-5 text-[11px] font-semibold text-gray-900">
          <span>9:41</span>
          <div className="flex items-center gap-1 text-gray-900">
            <SignalBarsIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* Dynamic island */}
        <div className="pointer-events-none absolute left-1/2 top-2 z-10 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div style={{ zoom: 0.62 }}>
            {Component ? (
              <Component content={content} />
            ) : (
              <ThumbnailFallback url={thumbnail} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThumbnailFallback({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-gray-400">
        Немає прев&apos;ю
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt=""
      className="h-full w-full object-cover"
    />
  );
}

const STATUS_BADGE: Record<SiteStatus, { label: string; className: string }> = {
  DRAFT: { label: "ЧЕРНЕТКА", className: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "АКТИВНО", className: "bg-green-100 text-green-700" },
  SUSPENDED: { label: "ПРИЗУПИНЕНО", className: "bg-amber-100 text-amber-700" },
  INACTIVE: { label: "НЕАКТИВНО", className: "bg-gray-200 text-gray-600" },
};

function StatusBadge({ status }: { status: SiteStatus }) {
  const meta = STATUS_BADGE[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function PrimaryAction({
  site,
  onSiteUpdate,
}: {
  site: Site;
  onSiteUpdate: (s: Site) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publishWithStubPayment() {
    // No payment provider yet — fake latency, then /publish to flip ACTIVE (Stripe Checkout later).
    setBusy(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${site.id}/publish`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      router.push("/admin?published=true");
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setBusy(false);
    }
  }

  async function resume() {
    setBusy(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/sites/${site.id}/publish`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      const updated: Site = await res.json();
      onSiteUpdate(updated);
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setBusy(false);
    }
  }

  const baseClass =
    "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition disabled:opacity-60";
  const payClass = `${baseClass} bg-neutral-900 text-white hover:bg-neutral-800`;

  let button: React.ReactNode;
  if (site.status === "DRAFT") {
    button = (
      <button
        type="button"
        onClick={publishWithStubPayment}
        disabled={busy}
        className={payClass}
      >
        <SendIconSmall />
        {busy ? "Обробляємо оплату..." : "Перейти до оплати"}
      </button>
    );
  } else if (site.status === "INACTIVE") {
    button = (
      <button
        type="button"
        onClick={publishWithStubPayment}
        disabled={busy}
        className={payClass}
      >
        <SendIconSmall />
        {busy ? "Обробляємо оплату..." : "Поновити підписку"}
      </button>
    );
  } else if (site.status === "ACTIVE") {
    button = (
      <a
        href={`https://${site.subdomain}.${ROOT_DOMAIN}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} bg-neutral-900 text-white hover:bg-neutral-800`}
      >
        <SendIconSmall />
        Відкрити сайт
      </a>
    );
  } else {
    // SUSPENDED — resume without a new payment
    button = (
      <button
        type="button"
        onClick={resume}
        disabled={busy}
        className={`${baseClass} bg-green-600 text-white hover:bg-green-700`}
      >
        {busy ? "Відновлюємо..." : "Відновити публікацію"}
      </button>
    );
  }

  return (
    <>
      {button}
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}
    </>
  );
}

function InfoCard({ status }: { status: SiteStatus }) {
  // Content adapts to status: onboarding for unpaid, operational for live, resume for suspended.
  let title: string;
  let bullets: string[];

  if (status === "DRAFT" || status === "INACTIVE") {
    title = "Важлива інформація";
    bullets = [
      "Після оплати сайт буде автоматично запущений",
      "Можливість скасовувати підписку в будь-який момент",
      "Можливість редагувати контент в будь-який момент",
    ];
  } else if (status === "ACTIVE") {
    title = "Сайт у роботі";
    bullets = [
      "Підписка автоматично продовжується щомісяця",
      "Можете призупинити публікацію в будь-який момент",
      "Контент можна редагувати без переоплати",
    ];
  } else {
    // SUSPENDED
    title = "Сайт призупинено";
    bullets = [
      "Підписка лишається активною, повторної оплати не потрібно",
      "Відновлення публікації — миттєве, у один клік",
      "Контент і піддомен зберігаються",
    ];
  }

  return (
    <section className="rounded-[20px] border border-[#E6E6E6] bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-xs text-gray-600">
        {bullets.map((b) => (
          <InfoBullet key={b}>{b}</InfoBullet>
        ))}
      </ul>
    </section>
  );
}

function PriceCell({ amount, label }: { amount: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-gray-900">{amount}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FeatureIcon({ name }: { name?: string }) {
  const className = "h-4 w-4 shrink-0 text-gray-500";
  if (name === "file") return <FileIcon className={className} />;
  return <SignalIcon className={className} />;
}

function InfoBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span>{children}</span>
    </li>
  );
}

function SendIconSmall() {
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
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l18-9-9 18-2-7-7-2z"
      />
    </svg>
  );
}

function SignalBarsIcon() {
  return (
    <svg
      className="h-2.5 w-3.5"
      viewBox="0 0 16 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="8.5" width="2.5" height="3.5" rx="0.5" />
      <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
      <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
      <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      className="h-2.5 w-3.5"
      viewBox="0 0 16 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 10.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM1.7 4.4C3.4 2.7 5.6 1.7 8 1.7s4.6 1 6.3 2.7l-1.5 1.5C11.5 4.6 9.8 3.9 8 3.9s-3.5 0.7-4.8 2L1.7 4.4Zm2.7 2.7C5.4 6.3 6.6 5.9 8 5.9s2.6 0.4 3.6 1.2L10.1 8.6C9.5 8.2 8.8 7.9 8 7.9s-1.5 0.3-2.1 0.7L4.4 7.1Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg
      className="h-2.5 w-5"
      viewBox="0 0 24 12"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width="20"
        height="11"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <rect x="2.5" y="2.5" width="16" height="7" rx="1" fill="currentColor" />
      <rect
        x="21.25"
        y="4"
        width="1.5"
        height="4"
        rx="0.5"
        fill="currentColor"
      />
    </svg>
  );
}
