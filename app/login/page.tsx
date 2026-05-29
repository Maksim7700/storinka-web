"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import GoogleButton from "../_components/GoogleButton";
import PasswordInput from "../_components/PasswordInput";
import {
  BTN_PRIMARY_CLASS,
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from "../_components/styles";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "true";
  const tokenError = params.get("error") === "invalid-token";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 401) setError("Невірний email або пароль");
        else if (res.status === 403) setError("Акаунт заблоковано");
        else if (res.status === 409)
          // Backend signals "this email is registered via Google" with 409 +
          // a Ukrainian message — surface it as-is so the user knows to use
          // the Google button below.
          setError(
            body?.message ??
              "Цей email зареєстровано через Google. Увійдіть через Google.",
          );
        else setError("Не вдалось увійти. Спробуйте пізніше");
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
          Вхід
        </h1>

        {verified && (
          <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
            Email підтверджено. Тепер можете увійти.
          </p>
        )}
        {tokenError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            Невірне або прострочене посилання підтвердження.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label htmlFor="password" className={LABEL_CLASS}>
              Пароль
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            <Link
              href="/forgot-password"
              className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-700"
            >
              Забули пароль?
            </Link>
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
              {loading ? "Зачекайте..." : "Вхід"}
            </button>

            <GoogleButton intent="login" onError={setError} />
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Немає акаунту?{" "}
          <Link
            href="/register"
            className="font-semibold text-gray-900 hover:underline"
          >
            Зареєструватись
          </Link>
        </p>
      </div>
    </div>
  );
}
