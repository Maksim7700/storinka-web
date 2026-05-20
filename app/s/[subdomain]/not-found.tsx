import Link from "next/link";

/**
 * Rendered when GET /api/vendors/{subdomain}/site returns 404.
 * That happens for both "no such site" and "site exists but is DRAFT"
 * — we keep the message ambiguous so DRAFT existence isn't leaked.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md text-center">
        <p className="font-serif text-8xl leading-none text-gray-300">404</p>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Сайт недоступний
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Можливо, такого сайту не існує — або власник ще не опублікував його.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-[10px] bg-neutral-900 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Перейти на Storinka
        </Link>
      </div>
    </div>
  );
}
