"use client";

import { useState } from "react";
import Link from "next/link";
import EmailAuth from "@/components/auth/EmailAuth";
import PhoneAuth from "@/components/auth/PhoneAuth";
import GoogleButton from "@/components/auth/GoogleButton";

type Tab = "email" | "phone" | "google";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "google", label: "Google" },
];

export default function SignupPage() {
  const [tab, setTab] = useState<Tab>("email");
  const [error, setError] = useState("");

  return (
    <div className="animate-fade-in-soft">
      <h1 className="text-3xl font-bold tracking-tight mb-1.5 text-center">
        Create your account
      </h1>
      <p className="text-sm text-muted text-center mb-6">
        Get 100 free credits to start creating
      </p>

      <div className="flex gap-1 rounded-xl bg-surface p-1 mb-6" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setError("");
            }}
            className={`auth-tab flex-1 ${tab === t.id ? "active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 animate-fade-up"
          role="alert"
        >
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="mb-6 min-h-[240px]">
        {tab === "email" && <EmailAuth mode="signup" onError={setError} />}
        {tab === "phone" && <PhoneAuth mode="signup" onError={setError} />}
        {tab === "google" && <GoogleButton mode="signup" onError={setError} />}
      </div>

      <div className="divider-label my-6">or sign up with</div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            setTab("google");
            setError("");
          }}
          className="btn btn-secondary w-full justify-center gap-3 py-3 hover-lift"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.5.75 3.6 3.3 1.62 7.02l3.66 2.84C6.24 7.02 8.94 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.25 12.27c0-.93-.09-1.64-.24-2.36H12v4.46h6.3c-.12 1.02-.81 2.55-2.34 3.58l3.6 2.79c2.16-1.98 3.69-4.92 3.69-8.47z" />
            <path fill="#FBBC05" d="M5.31 14.13a7.1 7.1 0 0 1 0-4.26L1.62 7.02a11.2 11.2 0 0 0 0 9.96l3.69-2.85z" />
            <path fill="#34A853" d="M12 23.25c3 0 5.52-.99 7.35-2.7l-3.6-2.79c-.96.66-2.25 1.14-3.75 1.14-3.06 0-5.76-2-6.69-4.77l-3.66 2.85c1.98 3.72 5.88 6.27 10.35 6.27z" />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("phone");
            setError("");
          }}
          className="btn btn-secondary w-full justify-center gap-3 py-3 hover-lift"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Continue with phone
        </button>
      </div>

      <p className="text-sm text-muted text-center mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-light transition-colors font-medium"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
