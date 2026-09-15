"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: formData.get("token"),
          password: formData.get("password"),
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid or expired token");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Password reset</h1>
        <p className="text-sm text-muted mb-6">
          Your password has been updated successfully.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-center">Set new password</h1>
      <p className="text-sm text-muted text-center mb-6">
        Enter your reset token and new password
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium mb-1.5">
            Reset token
          </label>
          <input
            id="token"
            name="token"
            type="text"
            required
            className="input"
            placeholder="Paste your reset token"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="input"
            placeholder="Min 8 characters, uppercase, lowercase, number"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full mt-2"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="text-sm text-muted text-center mt-6">
        <Link href="/login" className="text-accent hover:text-accent-light transition-colors">
          Back to login
        </Link>
      </p>
    </div>
  );
}
