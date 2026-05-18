"use client";

import { GoogleIcon } from "./icons";

type Props = {
  label?: string;
};

export default function GoogleButton({ label = "Продовжити з Google" }: Props) {
  return (
    <button
      type="button"
      disabled
      title="Тимчасово недоступно — backend ендпоінт ще не реалізований"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}
