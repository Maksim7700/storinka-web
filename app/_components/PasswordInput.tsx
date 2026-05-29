"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";
import { INPUT_CLASS } from "./styles";

const ICON_CLASS = "h-5 w-5";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "Введіть текст",
  autoComplete = "current-password",
  required = true,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`${INPUT_CLASS} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Сховати пароль" : "Показати пароль"}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOffIcon className={ICON_CLASS} /> : <EyeIcon className={ICON_CLASS} />}
      </button>
    </div>
  );
}
