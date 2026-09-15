"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function EmailAuth({
  mode,
  onError,
}: {
  mode: "login" | "signup";
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError?.("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError?.(data.error || (mode === "login" ? "Invalid credentials" : "Something went wrong"));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="input"
            placeholder="Your name"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 8 : undefined}
          className="input"
          placeholder={mode === "signup" ? "Min 8 chars, upper, lower, number" : "Your password"}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full mt-2 btn-shine"
      >
        {loading ? (
          <span className="ring-loader" />
        ) : mode === "login" ? (
          "Log in"
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
