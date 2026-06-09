import Link from "next/link";
import FAQ from "./_components/landing/FAQ";
import HeroVisual from "./_components/landing/HeroVisual";
import Reveal from "./_components/landing/Reveal";
import {
  CatalogIcon,
  MonitorIcon,
  SendIcon,
  SignalIcon,
  SphereIcon,
  SupportIcon,
  TransactionsIcon,
} from "./_components/icons";
import { ROOT_DOMAIN } from "./_lib/constants";

// ---- types ----------------------------------------------------------------

type TemplateSummary = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  licensePrice: number;
  monthlyPrice: number;
};

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const CATEGORY_META: Record<string, { label: string; bg: string }> = {
  beauty: { label: "САЛОН КРАСИ", bg: "#EC4899" },
  food: { label: "РЕСТОРАН", bg: "#F97316" },
  auto: { label: "АВТО", bg: "#3B82F6" },
  business: { label: "БІЗНЕС", bg: "#10B981" },
  creative: { label: "ПОРТФОЛІО", bg: "#191919" },
};

// Uniform license fee; per-template monthly fee comes from TemplateSummary.
const LICENSE_PRICE = 2000;
// Marketing floor ("від X грн/міс"); real per-template price is on TemplateSummary.
const SUBSCRIPTION_FROM = 490;

const numberFormat = new Intl.NumberFormat("uk-UA");

// Best-effort: backend down → landing still renders, just without templates.
async function fetchTemplates(): Promise<TemplateSummary[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/templates`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ---- page -----------------------------------------------------------------

export default async function HomePage() {
  const templates = await fetchTemplates();
  const featured = templates[0] ?? null;

  return (
    <div className="flex-1 overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero featured={featured} />
        <Marquee />
        <Stats />
        <HowItWorks />
        <TemplatesSection templates={templates} />
        <Features />
        <Pricing />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

// ---- navbar ---------------------------------------------------------------

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E6E6E6]/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-neutral-900"
        >
          Storinka
        </Link>
        <nav className="hidden gap-8 md:flex">
          <a
            href="#how"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Як це працює
          </a>
          <a
            href="#templates"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Шаблони
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Ціни
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:inline-flex"
          >
            Увійти
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Створити сайт
          </Link>
        </div>
      </div>
    </header>
  );
}

// ---- hero -----------------------------------------------------------------

function Hero({ featured }: { featured: TemplateSummary | null }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft background bloom */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/40 via-white to-white" />
      <div className="absolute -right-32 -top-32 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-pink-200/40 via-orange-200/40 to-amber-200/40 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Запуск сайту за 10 хвилин
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                Сайт для твого бізнесу.{" "}
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Без коду.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg text-gray-600 md:text-xl">
                Обери готовий шаблон, заповни дані — і твій лендінг живе на
                власному піддомені{" "}
                <span className="font-semibold text-gray-900">
                  {ROOT_DOMAIN}
                </span>
                . Жодного дизайнера, розробника чи місяців очікування.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-[10px] bg-neutral-900 px-6 text-base font-semibold text-white shadow-lg shadow-neutral-900/20 transition hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/30"
                >
                  Створити сайт
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
                <a
                  href="#templates"
                  className="inline-flex h-12 items-center rounded-[10px] border border-neutral-200 bg-white px-6 text-base font-semibold text-gray-900 transition hover:border-neutral-900 hover:shadow-sm"
                >
                  Подивитись шаблони
                </a>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckMark /> Без оплати картки
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckMark /> Український хостинг
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckMark /> Підтримка українською
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <HeroVisual
              template={
                featured
                  ? {
                      name: featured.name,
                      key: featured.key,
                      thumbnailUrl: featured.thumbnailUrl,
                    }
                  : null
              }
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CheckMark() {
  return (
    <svg
      className="h-4 w-4 text-green-500"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ---- marquee --------------------------------------------------------------

function Marquee() {
  const items = [
    "Салон краси",
    "Ресторан",
    "Кав'ярня",
    "СТО",
    "Фітнес-клуб",
    "Барбершоп",
    "Студія йоги",
    "Магазин",
    "Стоматологія",
    "Майстерня",
  ];
  // Duplicate to make the loop seamless.
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Бізнеси, що працюють на Storinka"
      className="border-y border-[#E6E6E6] bg-white py-6"
    >
      <div className="relative overflow-hidden">
        <div className="flex w-max gap-8 animate-marquee">
          {loop.map((label, i) => (
            <div
              key={i}
              className="flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400"
            >
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              {label}
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}

// ---- stats ----------------------------------------------------------------

function Stats() {
  const stats = [
    { value: "10", suffix: "хв", label: "Від реєстрації до публікації" },
    { value: "100", suffix: "%", label: "Адаптивний дизайн" },
    { value: "0", suffix: "грн", label: "За тестовий період" },
    { value: "24/7", suffix: "", label: "Український хостинг" },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="rounded-[20px] border border-[#E6E6E6] bg-white p-6 text-center transition hover:shadow-md">
                <div className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                  {s.value}
                  <span className="ml-0.5 text-2xl text-gray-400 md:text-3xl">
                    {s.suffix}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- how-it-works ---------------------------------------------------------

function HowItWorks() {
  const steps = [
    {
      n: "01",
      color: "text-orange-500",
      title: "Обери шаблон",
      desc: "Готові дизайни під твою сферу — салон, ресторан, кав'ярня, СТО та інші.",
    },
    {
      n: "02",
      color: "text-pink-500",
      title: "Заповни дані",
      desc: "Назва бізнесу, телефон, послуги, фото. Усе через зручну форму з підказками.",
    },
    {
      n: "03",
      color: "text-purple-500",
      title: "Опублікуй",
      desc: "Натискаєш «Опублікувати» — і сайт миттєво живе на твоєму піддомені.",
    },
  ];

  return (
    <section id="how" className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Як це працює
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Три кроки від нуля до живого сайту. Без коду, без зустрічей, без
            технічного завдання.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="group h-full rounded-[20px] border border-[#E6E6E6] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div
                  className={`origin-left text-5xl font-bold transition-transform duration-300 group-hover:scale-110 ${s.color}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- templates ------------------------------------------------------------

function TemplatesSection({ templates }: { templates: TemplateSummary[] }) {
  return (
    <section id="templates" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Готові шаблони
              </h2>
              <p className="mt-3 max-w-2xl text-lg text-gray-600">
                Кожен шаблон уже містить все необхідне: галерею, контакти,
                форму запису. Тобі лишається лише наповнити.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline"
            >
              Дивитись весь каталог{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        {templates.length === 0 ? (
          <Reveal delay={120}>
            <div className="mt-12 rounded-[20px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
              <CatalogIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">
                Каталог завантажується. Зайди через хвилину.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t, i) => {
              const meta = t.category ? CATEGORY_META[t.category] : null;
              return (
                <Reveal key={t.id} delay={(i % 3) * 100}>
                  <Link
                    href={`/preview/${t.key}`}
                    className="group block h-full overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                      {t.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.thumbnailUrl}
                          alt={t.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          Прев&apos;ю
                        </div>
                      )}
                      {meta && (
                        <span
                          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow"
                          style={{ backgroundColor: meta.bg }}
                        >
                          {meta.label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="line-clamp-2 text-sm text-gray-500">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-2 border-t border-[#E6E6E6] pt-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-bold text-gray-900">
                            {numberFormat.format(LICENSE_PRICE)} грн
                          </span>
                          <span className="text-sm text-gray-500">ліцензія</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          + {numberFormat.format(t.monthlyPrice)} грн/міс за хостинг
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ---- features -------------------------------------------------------------

function Features() {
  const items = [
    {
      Icon: SphereIcon,
      title: "Власний піддомен",
      desc: `Твій бізнес.${ROOT_DOMAIN} — налаштовується автоматично, без копання в DNS.`,
    },
    {
      Icon: SendIcon,
      title: "Миттєва публікація",
      desc: "Один клік — і сайт онлайн. Без деплоїв, серверів і чекати ніч.",
    },
    {
      Icon: MonitorIcon,
      title: "Адаптивний дизайн",
      desc: "Однаково гарно на телефоні, планшеті й моніторі. Тестувати не треба.",
    },
    {
      Icon: SignalIcon,
      title: "SEO з коробки",
      desc: "Швидке завантаження, чисті URL, мета-теги — Google любить такі сайти.",
    },
    {
      Icon: SupportIcon,
      title: "Жива підтримка",
      desc: "Пишеш українською, відповідаємо за хвилини. Без чат-ботів і шаблонів.",
    },
    {
      Icon: TransactionsIcon,
      title: "Гнучка оплата",
      desc: "Разовий платіж — шаблон твій назавжди. Або щомісяця — можна змінити шаблон.",
    },
  ];

  return (
    <section className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Усе, що треба для запуску
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Жодних плагінів, конструкторів, тем за 20$ — все вже всередині.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 80}>
              <div className="group h-full rounded-[20px] border border-[#E6E6E6] bg-white p-6 transition hover:border-neutral-900 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-neutral-900 text-white transition group-hover:bg-orange-500">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- pricing --------------------------------------------------------------

function Pricing() {
  const licenseFeatures = [
    "Без терміну дії — шаблон твій назавжди",
    "Усі майбутні оновлення безкоштовно",
    "Можна паузити: шаблон зберігається",
  ];
  const subscriptionFeatures = [
    "Хостинг, домен, SSL — включено",
    "Перший місяць — безкоштовно",
    "Pause anytime: офлайн — без списань",
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Прозорі ціни
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Платиш окремо за шаблон і за хостинг. Без сюрпризів, без
              прихованих платежів.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[24px] border border-[#E6E6E6] bg-white shadow-sm">
            <div className="grid md:grid-cols-2 md:divide-x md:divide-[#E6E6E6]">
              {/* ── License ── */}
              <div className="p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ліцензія шаблону
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {numberFormat.format(LICENSE_PRICE)}
                  </span>
                  <span className="text-base text-gray-500">грн / разово</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Купуєш шаблон один раз — він твій.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {licenseFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5">
                        <CheckMark />
                      </span>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Subscription ── */}
              <div className="relative p-8 md:p-10">
                <span className="absolute right-6 top-6 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  + до ліцензії
                </span>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Підписка (хостинг)
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gray-500">від</span>
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {numberFormat.format(SUBSCRIPTION_FROM)}
                  </span>
                  <span className="text-base text-gray-500">грн / міс</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Залежить від шаблону. Активна тільки коли сайт онлайн.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {subscriptionFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5">
                        <CheckMark />
                      </span>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA strip */}
            <div className="border-t border-[#E6E6E6] bg-neutral-50 p-6 md:p-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <div className="text-sm text-gray-500">
                    Старт від
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-gray-900">
                    {numberFormat.format(LICENSE_PRICE)} грн
                    <span className="text-gray-400"> + </span>
                    {numberFormat.format(SUBSCRIPTION_FROM)} грн/міс
                  </div>
                </div>
                <Link
                  href="/register"
                  className="group inline-flex h-12 items-center gap-2 rounded-[10px] bg-neutral-900 px-6 text-base font-semibold text-white shadow-lg shadow-neutral-900/20 transition hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/30"
                >
                  Створити сайт
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-gray-500">
            Реєстрація — безкоштовно. Оплата лише перед публікацією сайту.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---- faq ------------------------------------------------------------------

function FAQSection() {
  return (
    <section id="faq" className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Часті питання
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Якщо тут немає твого — напиши, додамо.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-10">
            <FAQ />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---- final cta ------------------------------------------------------------

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-neutral-900 px-8 py-16 text-center md:px-16 md:py-24">
            {/* Animated gradient blob */}
            <div className="absolute -left-32 -top-32 -z-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-orange-500/30 via-pink-500/30 to-purple-500/30 blur-3xl animate-gradient" />
            <div className="absolute -right-32 -bottom-32 -z-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-pink-500/30 via-purple-500/30 to-indigo-500/30 blur-3xl animate-gradient" />

            <div className="relative">
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Готовий запустити свій сайт?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Реєстрація — безкоштовно. Перший шаблон — за хвилини. Перший
                клієнт — сьогодні.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-[10px] bg-white px-8 text-lg font-bold text-neutral-900 transition hover:bg-gray-100 hover:shadow-2xl"
              >
                Створити сайт безкоштовно
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---- footer ---------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-[#E6E6E6] bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
        <div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            Storinka
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Сайти для українського бізнесу.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/login" className="transition hover:text-gray-900">
            Увійти
          </Link>
          <Link href="/register" className="transition hover:text-gray-900">
            Реєстрація
          </Link>
          <a href="#faq" className="transition hover:text-gray-900">
            FAQ
          </a>
        </div>
        <p className="w-full text-center text-xs text-gray-400 md:w-auto md:text-right">
          © 2026 Storinka. Зроблено в Україні.
        </p>
      </div>
    </footer>
  );
}
