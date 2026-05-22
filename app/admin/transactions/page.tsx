"use client";

import { TransactionsIcon } from "../../_components/icons";

// Placeholder until a payment provider is wired up. The table layout is
// already here so swapping in real data later is a one-line change in the
// section below.
type Transaction = {
  id: number;
  date: string;
  type: "Ліцензія" | "Підписка";
  amount: number;
  currency: "UAH";
  siteSubdomain: string;
  status: "Успішно" | "Очікує" | "Помилка";
};

const numberFormat = new Intl.NumberFormat("uk-UA");
const dateFormat = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function TransactionsPage() {
  const transactions: Transaction[] = [];

  return (
    <div className="mx-auto max-w-5xl px-16 py-10">
      <header className="mb-8 border-b border-[#E6E6E6] pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Транзакції</h1>
        <p className="mt-1 text-sm text-gray-500">
          Історія платежів за ліцензії та щомісячні підписки
        </p>
      </header>

      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <TransactionsTable rows={transactions} />
      )}
    </div>
  );
}

/* ────────── Empty state ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <section className="flex flex-col items-center justify-center rounded-[20px] border border-[#E6E6E6] bg-white px-8 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <TransactionsIcon className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-900">
        Транзакцій ще немає
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Тут зʼявляться платежі за ліцензії шаблонів та щомісячні підписки після
        першої публікації сайту.
      </p>
    </section>
  );
}

/* ────────── Table (used once we have real data) ────────────────────── */

function TransactionsTable({ rows }: { rows: Transaction[] }) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E6E6E6] text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="px-6 py-3 font-semibold">Дата</th>
            <th className="px-6 py-3 font-semibold">Сайт</th>
            <th className="px-6 py-3 font-semibold">Тип</th>
            <th className="px-6 py-3 font-semibold text-right">Сума</th>
            <th className="px-6 py-3 font-semibold">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E6E6E6]">
          {rows.map((t) => (
            <tr key={t.id} className="transition hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-900">
                {dateFormat.format(new Date(t.date))}
              </td>
              <td className="px-6 py-4 text-gray-600">{t.siteSubdomain}</td>
              <td className="px-6 py-4 text-gray-600">{t.type}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">
                {numberFormat.format(t.amount)} грн
              </td>
              <td className="px-6 py-4">
                <StatusPill status={t.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: Transaction["status"] }) {
  const map: Record<Transaction["status"], string> = {
    Успішно: "bg-green-100 text-green-700",
    Очікує: "bg-amber-100 text-amber-700",
    Помилка: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${map[status]}`}
    >
      {status}
    </span>
  );
}
