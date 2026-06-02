"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { INPUT_CLASS, LABEL_CLASS } from "../../_components/styles";
import { CheckIcon } from "../../_components/icons";

type Role = "USER" | "MANAGER" | "ADMIN";
type Plan = "TRIAL" | "BASIC" | "PRO";
type Status = "ACTIVE" | "SUSPENDED";

type Profile = {
  id: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  plan: Plan;
  status: Status;
  emailVerified: boolean;
};

const ROLE_LABEL: Record<Role, string> = {
  USER: "Користувач",
  MANAGER: "Менеджер",
  ADMIN: "Адмін",
};

const PLAN_LABEL: Record<Plan, string> = {
  TRIAL: "Trial",
  BASIC: "Basic",
  PRO: "Pro",
};

const PLAN_CLASS: Record<Plan, string> = {
  TRIAL: "bg-gray-100 text-gray-700",
  BASIC: "bg-blue-100 text-blue-700",
  PRO: "bg-amber-100 text-amber-800",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Profile = await res.json();
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Помилка");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loadError) {
    return (
      <div className="px-16 py-10 text-sm text-red-600">
        Не вдалось завантажити профіль. {loadError}
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="px-16 py-10 text-sm text-gray-500">Завантаження...</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-16 py-10">
      <ProfileHeader profile={profile} />

      <div className="mt-8 flex flex-col gap-6">
        <PersonalInfoSection
          profile={profile}
          onSaved={(p) => {
            setProfile(p);
            // Keep user-cache in sync so Sidebar etc. pick up the new name without reload.
            try {
              const cached = localStorage.getItem("user");
              if (cached) {
                const u = JSON.parse(cached);
                localStorage.setItem(
                  "user",
                  JSON.stringify({ ...u, fullName: p.fullName }),
                );
              }
            } catch {}
          }}
        />
        <AccountInfoSection profile={profile} />
        <SecuritySection />
      </div>
    </div>
  );
}

/* ────────── Hero header: name + email + badges ─────────────────────── */

function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E6E6E6] pb-6">
      <div className="min-w-0">
        <h1 className="truncate text-3xl font-bold text-gray-900">
          {profile.fullName || profile.email.split("@")[0]}
        </h1>
        <p className="mt-1 truncate text-sm text-gray-500">{profile.email}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#E6E6E6] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
          {ROLE_LABEL[profile.role]}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${PLAN_CLASS[profile.plan]}`}
        >
          {PLAN_LABEL[profile.plan]}
        </span>
      </div>
    </header>
  );
}

/* ────────── Personal info section ─────────────────────────────────── */

function PersonalInfoSection({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (p: Profile) => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  const dirty =
    fullName !== (profile.fullName ?? "") ||
    phone !== (profile.phone ?? "");

  async function handleSave() {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          fullName,
          phone: phone.trim() || null,
          avatarUrl: profile.avatarUrl, // preserved as-is
        }),
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
      const updated: Profile = await res.json();
      onSaved(updated);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1800);
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard
      title="Особиста інформація"
      hint="Як вас бачать інші користувачі та куди ми надсилаємо повідомлення"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="fullName" label="Повне ім'я">
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Іван Петренко"
          />
        </Field>
        <Field id="phone" label="Телефон">
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={INPUT_CLASS}
            placeholder="+380..."
          />
        </Field>
      </div>

      <SectionActions
        error={error}
        savedTick={savedTick}
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex h-10 cursor-pointer items-center rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Зберігаємо..." : "Зберегти зміни"}
          </button>
        }
      />
    </SectionCard>
  );
}

/* ────────── Account info section (read-only) ──────────────────────── */

function AccountInfoSection({ profile }: { profile: Profile }) {
  return (
    <SectionCard
      title="Акаунт"
      hint="Системна інформація — недоступна для редагування"
    >
      <dl className="divide-y divide-[#E6E6E6]">
        <Row
          label="Email"
          value={
            <span className="flex items-center gap-2">
              {profile.email}
              {profile.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  <CheckIcon className="h-3 w-3" /> Підтверджено
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Не підтверджено
                </span>
              )}
            </span>
          }
        />
        <Row label="Роль" value={ROLE_LABEL[profile.role]} />
        <Row
          label="Тариф"
          value={
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${PLAN_CLASS[profile.plan]}`}
            >
              {PLAN_LABEL[profile.plan]}
            </span>
          }
        />
        <Row
          label="Статус"
          value={profile.status === "ACTIVE" ? "Активний" : "Заблокований"}
        />
      </dl>
    </SectionCard>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}

/* ────────── Security section ───────────────────────────────────────── */

function SecuritySection() {
  const router = useRouter();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  const dirty = currentPassword.length > 0 && newPassword.length > 0;

  async function handleSubmit() {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.status === 401) {
        // 401 covers both wrong-password and expired-session — distinguish via body.
        const body = await res.json().catch(() => null);
        if (body?.message?.toLowerCase().includes("password")) {
          setError(body.message);
        } else {
          router.replace("/login");
        }
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `HTTP ${res.status}`);
        return;
      }
      setCurrent("");
      setNew("");
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1800);
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title="Безпека" hint="Зміна пароля для входу за email">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="currentPassword" label="Поточний пароль">
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className={INPUT_CLASS}
          />
        </Field>
        <Field
          id="newPassword"
          label="Новий пароль"
          hint="8+ символів, 1 велика літера, 1 цифра"
        >
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <SectionActions
        error={error}
        savedTick={savedTick}
        savedLabel="Пароль оновлено ✓"
        actions={
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!dirty || saving}
            className="flex h-10 cursor-pointer items-center rounded-[10px] bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Зберігаємо..." : "Змінити пароль"}
          </button>
        }
      />
    </SectionCard>
  );
}

/* ────────── Section primitives ─────────────────────────────────────── */

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#E6E6E6] bg-white p-6">
      <header className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function SectionActions({
  error,
  savedTick,
  savedLabel = "Збережено ✓",
  actions,
}: {
  error: string | null;
  savedTick: boolean;
  savedLabel?: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {savedTick && !error && (
        <p className="text-xs font-medium text-green-600">{savedLabel}</p>
      )}
      {actions}
    </div>
  );
}
