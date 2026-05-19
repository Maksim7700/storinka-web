"use client";

import { GoogleIcon } from "./icons";
import { BTN_SECONDARY_CLASS } from "./styles";

type Props = {
  label?: string;
};

export default function GoogleButton({ label = "Продовжити з Google" }: Props) {
  return (
    <button
      type="button"
      disabled
      title="Тимчасово недоступно — backend ендпоінт ще не реалізований"
      className={BTN_SECONDARY_CLASS}
    >
      <GoogleIcon className="h-5 w-5" />
      {label}
    </button>
  );
}
