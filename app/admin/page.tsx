import Link from "next/link";
import { BTN_PRIMARY_CLASS } from "../_components/styles";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <section className="flex flex-col items-center justify-center rounded-[20px] border border-[#E6E6E6] bg-white px-8 py-16 text-center">
        <EmptyStateIcon />
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
    </div>
  );
}

function EmptyStateIcon() {
  return (
    <svg
      className="h-16 w-16 text-gray-300"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 9h16.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 13.5h6M9 16.5h4.5"
      />
    </svg>
  );
}
