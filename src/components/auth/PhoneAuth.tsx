"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PhoneAuth({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  async function sendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    onError?.("");
    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error || "Could not send the code");
        return;
      }
      setStep("verify");
      if (data.demoCode) setDemoCode(data.demoCode);
      setResendIn(30);
      const interval = setInterval(() => {
        setResendIn((s) => {
          if (s <= 1) {
            clearInterval(interval);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      onError?.("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    onError?.("");
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error || "Could not verify the code");
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

  return (
    <div>
      {step === "send" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="+91 98765 43210"
            />
          </div>
          <button
            type="submit"
            disabled={loading || phone.trim().length < 5}
            className="btn btn-primary w-full mt-2 btn-shine"
          >
            {loading ? (
              <span className="ring-loader" />
            ) : (
              <span>{mode === "signup" ? "Continue with phone" : "Send login code"}</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-4 animate-fade-up">
          {demoCode && (
            <div className="rounded-lg border border-yellow-400/25 bg-yellow-400/10 px-3 py-2.5">
              <p className="text-xs text-yellow-300 font-medium">Demo mode</p>
              <p className="text-sm text-yellow-200 mt-0.5">
                Your code is <span className="font-bold tracking-widest">{demoCode}</span>
              </p>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="otp-code" className="text-sm font-medium">
                Enter 6-digit code
              </label>
              <span className="text-xs text-muted">{phone}</span>
            </div>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="input text-center text-xl tracking-[0.5em] font-semibold"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn btn-primary w-full mt-2 btn-shine"
          >
            {loading ? <span className="ring-loader" /> : "Verify & continue"}
          </button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep("send")}
              className="text-muted hover:text-foreground transition-colors"
            >
              ← Change number
            </button>
            <button
              type="button"
              disabled={resendIn > 0}
              onClick={() => {
                setCode("");
                setStep("send");
                // auto re-send on same screen
              }}
              className="text-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
