"use client";

import { useState } from "react";
import type { TemplateComponentProps } from "./types";

type SalonContent = {
  businessName?: string;
  tagline?: string;
  description?: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
};

type ResolvedContent = {
  businessName: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  primary: string;
};

const DEFAULTS: ResolvedContent = {
  businessName: "Lumina Salon",
  tagline: "Краса в кожній деталі",
  description:
    "Сучасний салон з повним спектром послуг. Стрижки, фарбування, манікюр, догляд за обличчям. Команда майстрів з понад 10-річним досвідом подбає про ваш образ від голови до кінчиків пальців.",
  phone: "+380 50 123 45 67",
  address: "Київ, Хрещатик 1",
  primary: "#C9A86C",
};

const SERVICES = [
  { name: "Стрижка", description: "Жіноча, чоловіча, дитяча", priceFrom: 500 },
  { name: "Фарбування", description: "Однотонне, мелірування, омбре", priceFrom: 1500 },
  { name: "Манікюр", description: "Класичний, гель-лак, дизайн", priceFrom: 600 },
  { name: "Педикюр", description: "Апаратний, з покриттям", priceFrom: 800 },
  { name: "Макіяж", description: "Денний, вечірній, весільний", priceFrom: 1200 },
  { name: "Догляд за обличчям", description: "Чистка, маски, масаж", priceFrom: 900 },
];

const REASONS = [
  {
    title: "10+ років досвіду",
    body: "Наші майстри регулярно проходять навчання та підтверджують сертифікати у провідних академіях.",
  },
  {
    title: "Преміум-продукти",
    body: "Працюємо тільки з брендами L'Oréal Professional, Wella, OPI та CND.",
  },
  {
    title: "Затишна атмосфера",
    body: "Простір, де ви відчуваєте себе як удома. Кава, музика, відсутність поспіху.",
  },
];

const numberFormat = new Intl.NumberFormat("uk-UA");

function resolve(content: SalonContent | undefined): ResolvedContent {
  return {
    businessName: content?.businessName || DEFAULTS.businessName,
    tagline: content?.tagline || DEFAULTS.tagline,
    description: content?.description || DEFAULTS.description,
    phone: content?.phone || DEFAULTS.phone,
    address: content?.address || DEFAULTS.address,
    primary: content?.primaryColor || DEFAULTS.primary,
  };
}

// Container query breakpoints used:
//   @xl  ≈ 576px  → small-tablet column splits
//   @3xl ≈ 768px  → desktop nav, multi-col grids, larger headings
//   @5xl ≈ 1024px → wide multi-col layouts (e.g. 3-col services)
// Using `@container` on the root means responsive layout reacts to the
// element's own width, not the viewport — so the mobile mockup (~250px) and
// a real phone (~390px) both correctly render the mobile layout.

export function BeautySalonTemplate({ content }: TemplateComponentProps) {
  const c = resolve(content as SalonContent | undefined);

  return (
    <div className="@container bg-white text-[#1F1F1F]">
      <Header c={c} />
      <Hero c={c} />
      <ServicesSection c={c} />
      <ReasonsSection c={c} />
      <GallerySection c={c} />
      <BookingCta c={c} />
      <FooterSection c={c} />
    </div>
  );
}

function Header({ c }: { c: ResolvedContent }) {
  const [open, setOpen] = useState(false);
  const telHref = `tel:${c.phone.replace(/\s+/g, "")}`;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 @3xl:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-base font-semibold text-white @3xl:h-10 @3xl:w-10 @3xl:text-lg"
            style={{ backgroundColor: c.primary }}
          >
            {c.businessName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate font-serif text-base font-semibold tracking-wide @3xl:text-lg">
            {c.businessName}
          </span>
        </div>

        {/* Desktop nav (≥768px container) */}
        <nav className="hidden items-center gap-7 text-sm text-gray-700 @3xl:flex">
          <a href="#services" className="hover:text-gray-900">Послуги</a>
          <a href="#about" className="hover:text-gray-900">Про нас</a>
          <a href="#gallery" className="hover:text-gray-900">Галерея</a>
          <a href="#contacts" className="hover:text-gray-900">Контакти</a>
        </nav>

        <a
          href={telHref}
          className="hidden rounded-full px-5 py-2 text-sm font-semibold text-white @3xl:inline-flex"
          style={{ backgroundColor: c.primary }}
        >
          Записатись
        </a>

        {/* Mobile burger (<768px container) */}
        <button
          type="button"
          aria-label={open ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 @3xl:hidden"
        >
          {open ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-5 py-4 @3xl:hidden">
          <nav className="flex flex-col text-sm text-gray-700">
            <a
              href="#services"
              onClick={() => setOpen(false)}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              Послуги
            </a>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              Про нас
            </a>
            <a
              href="#gallery"
              onClick={() => setOpen(false)}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              Галерея
            </a>
            <a
              href="#contacts"
              onClick={() => setOpen(false)}
              className="border-b border-gray-100 py-3 last:border-b-0"
            >
              Контакти
            </a>
          </nav>
          <a
            href={telHref}
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: c.primary }}
          >
            Записатись
          </a>
        </div>
      )}
    </header>
  );
}

function Hero({ c }: { c: ResolvedContent }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-12 @3xl:grid-cols-2 @3xl:gap-12 @3xl:px-6 @3xl:py-24">
      <div>
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] @3xl:text-xs"
          style={{ color: c.primary }}
        >
          {c.tagline}
        </p>
        <h1 className="font-serif text-3xl font-semibold leading-tight @xl:text-4xl @3xl:text-6xl">
          {c.businessName}
        </h1>
        <p className="mt-4 max-w-md text-sm text-gray-600 @3xl:mt-5 @3xl:text-base">
          {c.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 @3xl:mt-8">
          <a
            href="#contacts"
            className="rounded-full px-5 py-3 text-sm font-semibold text-white @3xl:px-6"
            style={{ backgroundColor: c.primary }}
          >
            Записатись
          </a>
          <a
            href="#services"
            className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-900 @3xl:px-6"
          >
            Переглянути послуги
          </a>
        </div>
      </div>

      <div className="relative">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[28px] @3xl:rounded-[32px]"
          style={{
            background: `linear-gradient(135deg, ${c.primary}, #2A1F12)`,
          }}
        >
          <div
            className="absolute -left-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: c.primary }}
          />
          <div className="absolute right-8 top-10 text-3xl text-white/70">✦</div>
          <div className="absolute right-20 top-32 text-2xl text-white/50">✦</div>
          <div className="absolute left-10 bottom-16 text-4xl text-white/60">✧</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-serif text-6xl text-white/30 @3xl:text-7xl">
              {c.businessName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ c }: { c: ResolvedContent }) {
  return (
    <section id="services" className="bg-[#FAF7F2] py-14 @3xl:py-20">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-6">
        <div className="mb-8 max-w-2xl @3xl:mb-12">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] @3xl:text-xs"
            style={{ color: c.primary }}
          >
            Наші послуги
          </p>
          <h2 className="font-serif text-2xl font-semibold @xl:text-3xl @3xl:text-4xl">
            Все, що потрібно для вашого образу
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @5xl:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md @3xl:p-6"
            >
              <div
                className="mb-3 h-1 w-12 rounded-full @3xl:mb-4"
                style={{ backgroundColor: c.primary }}
              />
              <h3 className="font-serif text-lg font-semibold @3xl:text-xl">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-gray-600">{s.description}</p>
              <p className="mt-4 text-sm text-gray-500">
                від{" "}
                <span
                  className="text-base font-semibold @3xl:text-lg"
                  style={{ color: c.primary }}
                >
                  {numberFormat.format(s.priceFrom)} грн
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReasonsSection({ c }: { c: ResolvedContent }) {
  return (
    <section id="about" className="py-14 @3xl:py-20">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-6">
        <div className="mb-8 max-w-2xl @3xl:mb-12">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] @3xl:text-xs"
            style={{ color: c.primary }}
          >
            Чому нас обирають
          </p>
          <h2 className="font-serif text-2xl font-semibold @xl:text-3xl @3xl:text-4xl">
            Гарантія якості та комфорту
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3 @3xl:gap-8">
          {REASONS.map((r, idx) => (
            <div key={r.title}>
              <div
                className="mb-3 font-serif text-3xl @3xl:mb-4 @3xl:text-4xl"
                style={{ color: c.primary }}
              >
                0{idx + 1}
              </div>
              <h3 className="font-serif text-lg font-semibold @3xl:text-xl">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection({ c }: { c: ResolvedContent }) {
  return (
    <section id="gallery" className="bg-[#FAF7F2] py-14 @3xl:py-20">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-6">
        <div className="mb-8 max-w-2xl @3xl:mb-12">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] @3xl:text-xs"
            style={{ color: c.primary }}
          >
            Галерея робіт
          </p>
          <h2 className="font-serif text-2xl font-semibold @xl:text-3xl @3xl:text-4xl">
            Деякі з останніх трансформацій
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl"
              style={{
                background: `linear-gradient(${(i * 47) % 360}deg, ${c.primary}66, ${c.primary}10)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingCta({ c }: { c: ResolvedContent }) {
  return (
    <section
      id="contacts"
      className="relative overflow-hidden py-16 @3xl:py-24"
      style={{ backgroundColor: c.primary }}
    >
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-5 text-center text-white @3xl:px-6">
        <h2 className="font-serif text-2xl font-semibold @xl:text-3xl @3xl:text-5xl">
          Запишіться на консультацію
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 @3xl:mt-4 @3xl:text-base">
          Зателефонуйте — підберемо зручний час та послугу, відповімо на всі
          запитання.
        </p>
        <a
          href={`tel:${c.phone.replace(/\s+/g, "")}`}
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold @3xl:mt-8 @3xl:px-8 @3xl:py-4 @3xl:text-base"
          style={{ color: c.primary }}
        >
          {c.phone}
        </a>
      </div>
    </section>
  );
}

function FooterSection({ c }: { c: ResolvedContent }) {
  return (
    <footer className="bg-[#1F1F1F] py-10 text-sm text-gray-300 @3xl:py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 @xl:grid-cols-2 @3xl:grid-cols-4 @3xl:gap-8 @3xl:px-6">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg font-semibold text-white"
              style={{ backgroundColor: c.primary }}
            >
              {c.businessName.charAt(0).toUpperCase()}
            </div>
            <span className="font-serif text-lg font-semibold text-white">
              {c.businessName}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-400 @3xl:mt-4">{c.tagline}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Телефон
          </p>
          <a
            href={`tel:${c.phone.replace(/\s+/g, "")}`}
            className="mt-2 block text-white"
          >
            {c.phone}
          </a>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Адреса
          </p>
          <p className="mt-2 text-white">{c.address}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Графік
          </p>
          <p className="mt-2">Пн–Пт: 09:00 — 21:00</p>
          <p>Сб–Нд: 10:00 — 20:00</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-gray-700 px-5 pt-5 text-xs text-gray-500 @3xl:mt-10 @3xl:px-6 @3xl:pt-6">
        © {new Date().getFullYear()} {c.businessName}. Всі права збережено.
      </div>
    </footer>
  );
}
