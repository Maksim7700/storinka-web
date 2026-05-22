"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyStateIcon, SphereIcon } from "../_components/icons";
import { BTN_PRIMARY_CLASS } from "../_components/styles";
import FilterDropdown from "./_components/FilterDropdown";
import SiteCard, { type SiteSummary } from "./_components/SiteCard";

type LoadState = "loading" | "ready" | "error";

const CATEGORY_LABELS: Record<string, string> = {
  beauty: "Краса",
  food: "Їжа",
  auto: "Авто",
  business: "Бізнес",
};

const ALL = "__all__";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(ALL);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) {
      if (s.templateCategory) set.add(s.templateCategory);
    }
    return [
      { value: ALL, label: "Усі сфери" },
      ...Array.from(set)
        .sort()
        .map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
    ];
  }, [sites]);

  const filteredSites = useMemo(() => {
    if (category === ALL) return sites;
    return sites.filter((s) => s.templateCategory === category);
  }, [sites, category]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await fetch("/api/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: SiteSummary[] = await res.json();
        if (!cancelled) {
          setSites(data);
          setState("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setState("error");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="px-16 py-8">
      {state === "loading" && <LoadingState />}
      {state === "error" && <ErrorState message={error} />}
      {state === "ready" && sites.length === 0 && <EmptyState />}
      {state === "ready" && sites.length > 0 && (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <FilterDropdown
              icon={<SphereIcon className="h-4 w-4" />}
              label="Сфера"
              value={category}
              options={categoryOptions}
              onChange={setCategory}
            />
          </div>

          {filteredSites.length === 0 ? (
            <p className="rounded-[20px] border border-[#E6E6E6] bg-white px-6 py-16 text-center text-sm text-gray-500">
              Немає сайтів у цій сфері.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSites.map((s) => (
                <SiteCard
                  key={s.id}
                  site={s}
                  onDeleted={(id) =>
                    setSites((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white"
        >
          <div className="aspect-[16/10] animate-pulse bg-gray-100" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-12 animate-pulse rounded-[10px] bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700">
      Не вдалось завантажити список сайтів.
      {message && <span className="block text-xs text-red-500">{message}</span>}
    </div>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center rounded-[20px] border border-[#E6E6E6] bg-white px-8 py-16 text-center">
      <EmptyStateIcon className="h-16 w-16 text-gray-300" />
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        У вас ще немає сайтів
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Оберіть шаблон, заповніть контент, отримайте живий сайт на своєму
        піддомені за кілька хвилин.
      </p>
      <Link
        href="/admin/catalog"
        className={`${BTN_PRIMARY_CLASS} mt-6 max-w-[280px]`}
      >
        Створити сайт
      </Link>
    </section>
  );
}
