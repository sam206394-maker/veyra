"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: string;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.5.75 3.6 3.3 1.62 7.02l3.66 2.84C6.24 7.02 8.94 5.04 12 5.04z" />
      <path fill="#4285F4" d="M23.25 12.27c0-.93-.09-1.64-.24-2.36H12v4.46h6.3c-.12 1.02-.81 2.55-2.34 3.58l3.6 2.79c2.16-1.98 3.69-4.92 3.69-8.47z" />
      <path fill="#FBBC05" d="M5.31 14.13a7.1 7.1 0 0 1 0-4.26L1.62 7.02a11.2 11.2 0 0 0 0 9.96l3.69-2.85z" />
      <path fill="#34A853" d="M12 23.25c3 0 5.52-.99 7.35-2.7l-3.6-2.79c-.96.66-2.25 1.14-3.75 1.14-3.06 0-5.76-2-6.69-4.77l-3.66 2.85c1.98 3.72 5.88 6.27 10.35 6.27z" />
    </svg>
  );
}

export default function GoogleButton({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const renderedRef = useRef(false);

  async function completeWithCredential(credential: string) {
    setLoading(true);
    setDemoNotice(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error || "Google sign-in failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      onError?.("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    const email = "demo@veyra.app";
    const name = "Demo Creator";
    const b64 = (v: string) =>
      btoa(v).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await completeWithCredential(`mock.${b64(email)}.${b64(name)}`);
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !mountRef.current || renderedRef.current) return;

    const parent = mountRef.current;
    const render = () => {
      if (!window.google?.accounts?.id || renderedRef.current) return;
      renderedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        ux_mode: "popup",
        callback: (response) => completeWithCredential(response.credential),
      });
      window.google.accounts.id.renderButton(parent, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: parent.clientWidth || 320,
        text: mode === "signup" ? "signup_with" : "signin_with",
        shape: "pill",
        logo_alignment: "left",
      });
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID, mode]);

  if (DEMO_MODE && !GOOGLE_CLIENT_ID) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-secondary w-full py-3 justify-center gap-3 hover-lift"
        >
          {loading ? (
            <span className="ring-loader ring-loader-rose" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loading ? "Signing in…" : "Continue with Google"}</span>
        </button>
        <p className="text-[11px] text-muted text-center">
          Demo mode — no Google account needed. Creates a demo account instantly.
        </p>
        {demoNotice && <p className="text-xs text-yellow-400 text-center">{demoNotice}</p>}
      </div>
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="btn btn-secondary w-full py-3 justify-center gap-3 opacity-60"
        >
          <GoogleIcon />
          <span>Google login not configured</span>
        </button>
        <p className="text-[11px] text-muted text-center">
          Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={mountRef} className="flex justify-center [&>div]:w-full" />
      {demoNotice && <p className="text-xs text-yellow-400 text-center">{demoNotice}</p>}
    </div>
  );
}
