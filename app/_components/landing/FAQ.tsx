"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Чи потрібно знати програмування?",
    a: "Ні. Обираєш шаблон, заповнюєш форму з даними бізнесу — і твій сайт готовий. Без коду, без дизайнера, без розробника.",
  },
  {
    q: "Як швидко сайт буде онлайн?",
    a: "Миттєво. Натискаєш «Опублікувати» — і твій лендінг доступний за адресою твій-бізнес.storinka.com за кілька секунд.",
  },
  {
    q: "Чи можу я редагувати сайт після публікації?",
    a: "Так, у будь-який момент. Заходиш в адмін-панель, змінюєш текст, телефон, ціни або фото — зміни видно одразу.",
  },
  {
    q: "Що з оплатою?",
    a: "Платиш окремо за шаблон і за хостинг. Ліцензія шаблону — 2 000 грн разово, він твій назавжди. Підписка за хостинг — від 490 грн/міс (залежить від шаблону), активна тільки коли сайт онлайн. Перший місяць підписки — безкоштовно.",
  },
  {
    q: "Чи можна підключити власний домен?",
    a: "Так. Якщо вже маєш домен типу мій-салон.com.ua — підключаємо за кілька хвилин через CNAME-запис.",
  },
  {
    q: "А якщо щось не вийде?",
    a: "Пишеш у підтримку (українською) — допомагаємо з налаштуванням, заповненням, інтеграціями. Без бюрократії.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="space-y-3">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-[16px] border border-[#E6E6E6] bg-white transition hover:border-neutral-300"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-base font-semibold text-gray-900 md:text-lg">
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-xl text-gray-700 transition-transform duration-300 ${
                  isOpen ? "rotate-45 border-neutral-900 bg-neutral-900 text-white" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-gray-600 md:text-base">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
