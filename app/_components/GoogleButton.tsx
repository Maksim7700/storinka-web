"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoogleIcon } from "./icons";
import { BTN_SECONDARY_CLASS } from "./styles";

const GSI_SRC = "https://accounts.google.com/gsi/client";

type GsiButtonConfig = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
};

type GsiCallbackResponse = { credential: string };

type GsiInitConfig = {
  client_id: string;
  callback: (resp: GsiCallbackResponse) => void;
  auto_select?: boolean;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GsiInitConfig) => void;
          renderButton: (el: HTMLElement, config: GsiButtonConfig) => void;
        };
      };
    };
  }
}

/** Idempotently load Google Identity Services; multiple buttons share one <script>. */
function loadGsi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  const existing = document.querySelector(
    `script[src="${GSI_SRC}"]`,
  ) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("GSI load")));
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GSI load"));
    document.body.appendChild(s);
  });
}

type Props = {
  /** Backend uses this to reject login attempts for unknown Google emails. */
  intent: "login" | "register";
  /** Surface backend errors (404 / 409 / 503 / etc.) to the parent form. */
  onError?: (message: string) => void;
  /** Fallback label used when the env var is missing. */
  label?: string;
};

export default function GoogleButton({
  intent,
  onError,
  label = "Продовжити з Google",
}: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: containerRef.current.offsetWidth,
          logo_alignment: "center",
        });
      })
      .catch(() => {
        if (!cancelled) setScriptError(true);
      });
    return () => {
      cancelled = true;
    };
    // handleCredential omitted to avoid re-rendering the GIS button on parent updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function handleCredential(resp: GsiCallbackResponse) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: resp.credential,
          intent: intent.toUpperCase(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 404) {
          // Login intent + unknown Google account — pass backend's UA message through.
          onError?.(
            body?.message ??
              "Акаунт з таким Google email не знайдено. Зареєструйтесь.",
          );
        } else if (res.status === 409) {
          // Email already registered via password — pass backend's UA message through.
          onError?.(
            body?.message ??
              "Цей email зареєстровано через email/пароль. Увійдіть звичайним способом.",
          );
        } else if (res.status === 403) {
          onError?.("Акаунт заблоковано");
        } else if (res.status === 503) {
          onError?.("Google-вхід тимчасово недоступний");
        } else {
          onError?.("Не вдалось увійти через Google");
        }
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch {
      onError?.("Не вдалось підключитись до сервера");
    }
  }

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        title="NEXT_PUBLIC_GOOGLE_CLIENT_ID не задано в .env.local"
        className={BTN_SECONDARY_CLASS}
      >
        <GoogleIcon className="h-5 w-5" />
        {label}
      </button>
    );
  }

  if (scriptError) {
    return (
      <button
        type="button"
        disabled
        title="Не вдалось завантажити Google Identity Services"
        className={BTN_SECONDARY_CLASS}
      >
        <GoogleIcon className="h-5 w-5" />
        {label}
      </button>
    );
  }

  // min-height prevents layout shift while GIS script is loading.
  return <div ref={containerRef} className="flex min-h-[44px] justify-center" />;
}
