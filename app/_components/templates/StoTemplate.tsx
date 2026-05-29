"use client";

import type { TemplateComponentProps } from "./types";

type StoContent = {
  businessName?: string;
  description?: string;
  photo?: string;
  services?: string;
  phone?: string;
  map?: string;
  email?: string;
};

type ResolvedContent = {
  businessName: string;
  description: string;
  photo: string;
  services: string[];
  phone: string;
  map: string;
  email: string;
};

const DEFAULTS: ResolvedContent = {
  businessName: "Авто-Майстер",
  description:
    "Повний цикл обслуговування вашого авто: від планового ТО до складних ремонтів. Якісні запчастини, чесні строки, прозорі ціни.",
  photo: "",
  services: [
    "Заміна оливи та фільтрів",
    "Комп'ютерна діагностика",
    "Ремонт ходової частини",
    "Шиномонтаж та балансування",
    "Розвал-сходження",
    "Кондиціонер: заправка та ремонт",
  ],
  phone: "+380 50 123 45 67",
  map: "Київ, вул. Автомеханічна 5",
  email: "info@sto.ua",
};

// Services can come in as a string with newlines, semicolons or commas.
// We accept any of these so the user isn't locked into one format.
function parseServices(raw: string | undefined): string[] {
  if (!raw) return DEFAULTS.services;
  const items = raw
    .split(/[\n;,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : DEFAULTS.services;
}

function resolve(content: StoContent | undefined): ResolvedContent {
  return {
    businessName: content?.businessName || DEFAULTS.businessName,
    description: content?.description || DEFAULTS.description,
    photo: content?.photo || DEFAULTS.photo,
    services: parseServices(content?.services),
    phone: content?.phone || DEFAULTS.phone,
    map: content?.map || DEFAULTS.map,
    email: content?.email || DEFAULTS.email,
  };
}

// Container queries used (see BeautySalonTemplate for breakpoint rationale):
//   @xl ≈ 576px, @3xl ≈ 768px, @5xl ≈ 1024px.

export function StoTemplate({ content }: TemplateComponentProps) {
  const c = resolve(content as StoContent | undefined);

  return (
    <div className="@container bg-[#0F172A] text-white">
      <Header c={c} />
      <Hero c={c} />
      <ServicesSection c={c} />
      <ContactsSection c={c} />
      <Footer c={c} />
    </div>
  );
}

function Header({ c }: { c: ResolvedContent }) {
  const telHref = `tel:${c.phone.replace(/\s+/g, "")}`;
  return (
    <header className="border-b border-white/10 bg-[#0F172A]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 @3xl:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 font-bold text-[#0F172A] @3xl:h-10 @3xl:w-10">
            {c.businessName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-base font-bold tracking-wide @3xl:text-lg">
            {c.businessName}
          </span>
        </div>
        <a
          href={telHref}
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-amber-300 @3xl:px-5"
        >
          {c.phone}
        </a>
      </div>
    </header>
  );
}

function Hero({ c }: { c: ResolvedContent }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-12 @3xl:grid-cols-2 @3xl:gap-12 @3xl:px-6 @3xl:py-20">
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400 @3xl:text-xs">
          СТО · ремонт та обслуговування
        </p>
        <h1 className="text-3xl font-bold leading-tight @xl:text-4xl @3xl:text-5xl">
          {c.businessName}
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/70 @3xl:mt-5 @3xl:text-base">
          {c.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 @3xl:mt-8">
          <a
            href={`tel:${c.phone.replace(/\s+/g, "")}`}
            className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-amber-300"
          >
            Записатись
          </a>
          <a
            href="#services"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white"
          >
            Наші послуги
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/30 to-slate-800 @3xl:aspect-[5/4]">
          {c.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.photo}
              alt={c.businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="text-sm italic text-white/60 @3xl:text-base">
                Завантажте фото у редакторі — воно зʼявиться тут.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ c }: { c: ResolvedContent }) {
  return (
    <section id="services" className="bg-[#0B1220] py-14 @3xl:py-20">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-6">
        <div className="mb-8 max-w-2xl @3xl:mb-12">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400 @3xl:text-xs">
            Що ми робимо
          </p>
          <h2 className="text-2xl font-bold @xl:text-3xl @3xl:text-4xl">
            Список послуг
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">
          {c.services.map((s, idx) => (
            <article
              key={`${s}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/60 @3xl:p-5"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-400 text-xs font-bold text-[#0F172A]">
                {idx + 1}
              </span>
              <p className="text-sm leading-snug @3xl:text-base">{s}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactsSection({ c }: { c: ResolvedContent }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(c.map)}&output=embed`;
  const telHref = `tel:${c.phone.replace(/\s+/g, "")}`;
  const mailHref = `mailto:${c.email}`;

  return (
    <section id="contacts" className="py-14 @3xl:py-20">
      <div className="mx-auto max-w-6xl px-5 @3xl:px-6">
        <div className="mb-8 max-w-2xl @3xl:mb-12">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400 @3xl:text-xs">
            Контакти
          </p>
          <h2 className="text-2xl font-bold @xl:text-3xl @3xl:text-4xl">
            Як нас знайти
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-2 @3xl:gap-8">
          <div className="space-y-4">
            <ContactRow label="Телефон" value={c.phone} href={telHref} />
            <ContactRow label="Email"   value={c.email} href={mailHref} />
            <ContactRow label="Адреса"  value={c.map} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {c.map ? (
              <iframe
                title={`Карта: ${c.map}`}
                src={mapSrc}
                loading="lazy"
                className="h-64 w-full @3xl:h-full @3xl:min-h-[260px]"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-white/40">
                Карта зʼявиться після того, як ви введете адресу.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      {href ? (
        <a
          href={href}
          className="mt-1 block text-base font-semibold text-white hover:text-amber-400"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 text-base font-semibold text-white">{value}</p>
      )}
    </div>
  );
}

function Footer({ c }: { c: ResolvedContent }) {
  return (
    <footer className="border-t border-white/10 bg-[#0B1220] py-8 @3xl:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 text-center text-xs text-white/50 @3xl:px-6">
        <p>
          © {new Date().getFullYear()} {c.businessName}. Всі права збережено.
        </p>
        <p>
          Створено з{" "}
          <a
            href="https://storinka.ua"
            className="font-semibold text-amber-400 hover:text-amber-300"
          >
            Storinka
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
