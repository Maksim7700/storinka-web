"use client";

import Link from "next/link";

type Props = {
  onMenuClick?: () => void;
};

export default function TopBar({ onMenuClick }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#E6E6E6] bg-white px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
        aria-label="Toggle navigation"
      >
        <MenuIcon />
      </button>
      <Link
        href="/admin"
        className="text-lg font-bold tracking-tight text-gray-900"
      >
        Logo
      </Link>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}
