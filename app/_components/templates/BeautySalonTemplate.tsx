import type { TemplateComponentProps } from "./types";

type SalonContent = {
  businessName?: string;
  tagline?: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
};

type ResolvedContent = {
  businessName: string;
  tagline: string;
  phone: string;
  address: string;
  primary: string;
};

const DEFAULTS: ResolvedContent = {
  businessName: "Lumina Salon",
  tagline: "Краса в кожній деталі",
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
    phone: content?.phone || DEFAULTS.phone,
    address: content?.address || DEFAULTS.address,
    primary: content?.primaryColor || DEFAULTS.primary,
  };
}

export function BeautySalonTemplate({ content }: TemplateComponentProps) {
  const c = resolve(content as SalonContent | undefined);

  return (
    <div className="bg-white text-[#1F1F1F]">
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
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-lg font-semibold text-white"
            style={{ backgroundColor: c.primary }}
          >
            {c.businessName.charAt(0).toUpperCase()}
          </div>
          <span className="font-serif text-lg font-semibold tracking-wide">
            {c.businessName}
          </span>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-gray-700 md:flex">
          <a href="#services">Послуги</a>
          <a href="#about">Про нас</a>
          <a href="#gallery">Галерея</a>
          <a href="#contacts">Контакти</a>
        </nav>

        <a
          href={`tel:${c.phone.replace(/\s+/g, "")}`}
          className="hidden rounded-full px-5 py-2 text-sm font-semibold text-white md:inline-flex"
          style={{ backgroundColor: c.primary }}
        >
          Записатись
        </a>
      </div>
    </header>
  );
}

function Hero({ c }: { c: ResolvedContent }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: c.primary }}
        >
          {c.tagline}
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          {c.businessName}
        </h1>
        <p className="mt-5 max-w-md text-base text-gray-600">
          Сучасний салон з повним спектром послуг. Стрижки, фарбування, манікюр,
          догляд за обличчям. Команда майстрів з понад 10-річним досвідом
          подбає про ваш образ від голови до кінчиків пальців.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contacts"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: c.primary }}
          >
            Записатись
          </a>
          <a
            href="#services"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-900"
          >
            Переглянути послуги
          </a>
        </div>
      </div>

      <div className="relative">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[32px]"
          style={{
            background: `linear-gradient(135deg, ${c.primary}, #2A1F12)`,
          }}
        >
          {/* Soft glow */}
          <div
            className="absolute -left-8 -top-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: c.primary }}
          />
          {/* Sparkle decorations */}
          <div className="absolute right-8 top-10 text-3xl text-white/70">✦</div>
          <div className="absolute right-20 top-32 text-2xl text-white/50">✦</div>
          <div className="absolute left-10 bottom-16 text-4xl text-white/60">✧</div>
          {/* Centered emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-serif text-7xl text-white/30">
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
    <section id="services" className="bg-[#FAF7F2] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: c.primary }}
          >
            Наші послуги
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Все, що потрібно для вашого образу
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: c.primary }}
              />
              <h3 className="font-serif text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-gray-600">{s.description}</p>
              <p className="mt-4 text-sm text-gray-500">
                від{" "}
                <span
                  className="text-lg font-semibold"
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
    <section id="about" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: c.primary }}
          >
            Чому нас обирають
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Гарантія якості та комфорту
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {REASONS.map((r, idx) => (
            <div key={r.title}>
              <div
                className="mb-4 font-serif text-4xl"
                style={{ color: c.primary }}
              >
                0{idx + 1}
              </div>
              <h3 className="font-serif text-xl font-semibold">{r.title}</h3>
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
    <section id="gallery" className="bg-[#FAF7F2] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: c.primary }}
          >
            Галерея робіт
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Деякі з останніх трансформацій
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
      className="relative overflow-hidden py-24"
      style={{ backgroundColor: c.primary }}
    >
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -left-10 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
        <h2 className="font-serif text-3xl font-semibold md:text-5xl">
          Запишіться на консультацію
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/90">
          Зателефонуйте — підберемо зручний час та послугу, відповімо на всі
          запитання.
        </p>
        <a
          href={`tel:${c.phone.replace(/\s+/g, "")}`}
          className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-base font-semibold"
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
    <footer className="bg-[#1F1F1F] py-14 text-sm text-gray-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-4">
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
          <p className="mt-4 text-xs text-gray-400">{c.tagline}</p>
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

      <div className="mx-auto mt-10 max-w-6xl border-t border-gray-700 px-6 pt-6 text-xs text-gray-500">
        © {new Date().getFullYear()} {c.businessName}. Всі права збережено.
      </div>
    </footer>
  );
}
