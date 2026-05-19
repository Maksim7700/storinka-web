import Link from "next/link";
import { EmptyStateIcon } from "../_components/icons";
import { BTN_PRIMARY_CLASS } from "../_components/styles";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
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
    </div>
  );
}
