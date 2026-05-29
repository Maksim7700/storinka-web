"use client";

import Link from "next/link";
import { MenuIcon } from "./icons";

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
        aria-label="Меню навігації"
      >
        <MenuIcon className="h-5 w-5" />
      </button>
      <Link
        href="/admin"
        className="text-lg font-bold tracking-tight text-gray-900"
      >
        Storinka
      </Link>
    </header>
  );
}
