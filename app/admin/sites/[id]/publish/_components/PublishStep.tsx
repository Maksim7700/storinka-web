"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, SendIcon } from "../../../../../_components/icons";
import { ROOT_DOMAIN } from "../../../../../_lib/constants";

type Site = {
  id: number;
  subdomain: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  templateId: number;
  templateKey: string;
  templateName: string;
  templateThumbnailUrl: string | null;
};

type Template = {
  licensePrice: number;
  monthlyPrice: number;
  description: string | null;
};

const numberFormat = new Intl.NumberFormat("uk-UA");

export default function PublishStep({ siteId }: { siteId: number }) {
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

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
          setLoadError(e instanceof Error ? e.message : "Помилка завантаження");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [siteId, router]);

  async function handlePay() {
    if (!site) return;
    setPaying(true);
    setPayError(null);
    try {
      // TODO: replace this stub with a real Stripe Checkout Session
      // (POST /api/payments/checkout → redirect to Stripe → webhook flips
      // the site to ACTIVE). For now we simulate latency and flip status
      // directly via the existing publish endpoint.
      await new Promise((r) => setTimeout(r, 1500));
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
        setPayError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      router.push("/admin?published=true");
    } catch {
      setPayError("Не вдалось підключитись до сервера");
    } finally {
      setPaying(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-gray-600">{loadError}</p>
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
      <div className="mx-auto max-w-md px-6 py-16 text-center text-sm text-gray-500">
        Завантаження...
      </div>
    );
  }

  const total = Number(template.licensePrice) + Number(template.monthlyPrice);
  const alreadyActive = site.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link
          href={`/admin/sites/${site.id}`}
          className="inline-flex items-center gap-1 hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Назад
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {alreadyActive ? "Сайт опубліковано" : "Майже готово"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {alreadyActive
            ? "Сайт уже доступний за адресою нижче."
            : "Завершіть оплату — і сайт стане доступним на вашому піддомені."}
        </p>
      </header>

      <section className="overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
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

        <div className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Шаблон
            </p>
            <p className="text-base font-semibold text-gray-900">
              {site.templateName}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Адреса
            </p>
            <p className="text-base font-semibold text-gray-900">
              {site.subdomain}.{ROOT_DOMAIN}
            </p>
          </div>

          <div className="rounded-[10px] border border-[#E6E6E6] bg-[#FAFAFA] p-4">
            <PriceRow
              label="Ліцензія (одноразово)"
              value={`${numberFormat.format(template.licensePrice)} грн`}
            />
            <PriceRow
              label="Підписка"
              value={`${numberFormat.format(template.monthlyPrice)} грн/міс`}
            />
            <div className="mt-3 flex items-center justify-between border-t border-[#E6E6E6] pt-3">
              <p className="text-sm font-semibold text-gray-900">
                Разом сьогодні
              </p>
              <p className="text-lg font-bold text-gray-900">
                {numberFormat.format(total)} грн
              </p>
            </div>
          </div>

          {payError && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {payError}
            </p>
          )}

          {alreadyActive ? (
            <Link
              href={`https://${site.subdomain}.${ROOT_DOMAIN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-900 text-base font-semibold text-white hover:bg-neutral-800"
            >
              <SendIcon className="h-4 w-4" />
              Відкрити сайт
            </Link>
          ) : (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-900 text-base font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {paying ? "Обробляємо оплату..." : `Оплатити ${numberFormat.format(total)} грн`}
            </button>
          )}

          <p className="text-center text-xs text-gray-400">
            Тестовий режим — реальної оплати не буде. Натиснення кнопки
            опублікує сайт.
          </p>
        </div>
      </section>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
