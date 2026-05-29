"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleButton from "../_components/GoogleButton";
import PasswordInput from "../_components/PasswordInput";
import {
  BTN_PRIMARY_CLASS,
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from "../_components/styles";

type FieldError = { field: string; defaultMessage: string };

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone: phone.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 409) {
          // Backend uses a distinct message when the email already belongs
          // to a Google account — show it as-is so the user knows to click
          // the Google button. Otherwise fall back to the generic conflict.
          const msg = typeof body?.message === "string" ? body.message : "";
          setError(
            msg.includes("Google") ? msg : "Користувач з таким email вже існує",
          );
        } else if (res.status === 400 && body?.errors?.length) {
          const first = (body.errors as FieldError[])[0];
          setError(first.defaultMessage ?? "Невірно заповнені поля");
        } else {
          setError("Не вдалось зареєструватись. Спробуйте пізніше");
        }
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch {
      setError("Не вдалось підключитись до сервера");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
      <div className={CARD_CLASS}>
        <h1 className="mb-8 text-center text-[28px] font-bold text-gray-900">
          Реєстрація
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className={LABEL_CLASS}>
              Повне ім&apos;я
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Введіть текст"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="email" className={LABEL_CLASS}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введіть текст"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="phone" className={LABEL_CLASS}>
              Телефон{" "}
              <span className="text-gray-400">(необов&apos;язково)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380XXXXXXXXX"
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="password" className={LABEL_CLASS}>
              Пароль
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <p className="mt-2 text-xs text-gray-500">
              Мінімум 8 символів, 1 велика літера, 1 цифра.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={BTN_PRIMARY_CLASS}
            >
              {loading ? "Зачекайте..." : "Реєстрація"}
            </button>

            <GoogleButton intent="register" onError={setError} />
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Вже маєте акаунт?{" "}
          <Link
            href="/login"
            className="font-semibold text-gray-900 hover:underline"
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
