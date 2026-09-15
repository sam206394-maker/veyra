"use client";

import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setName(d.user.name || "");
          setEmail(d.user.email || "");
        }
        setLoading(false);
      });
  }, []);

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) {
      setMsg("Profile updated");
      setUser({ ...user, name, email });
    } else {
      const d = await res.json();
      setMsg(d.error || "Failed to update");
    }
    setSaving(false);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setPwMsg("");
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: currentPw,
        newPassword: newPw,
      }),
    });
    if (res.ok) {
      setPwMsg("Password changed");
      setCurrentPw("");
      setNewPw("");
    } else {
      const d = await res.json();
      setPwMsg(d.error || "Failed");
    }
    setSaving(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <div className="skeleton h-96 rounded-xl" />;
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Settings</h1>

      <section className="mb-10">
        <h2 className="font-semibold mb-4">Profile</h2>
        <form onSubmit={handleProfile} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="input"
            />
          </div>
          {msg && <p className="text-sm text-green-400">{msg}</p>}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary self-start"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="font-semibold mb-4">Change password</h2>
        <form onSubmit={handlePassword} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current password</label>
            <input
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              type="password"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New password</label>
            <input
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              type="password"
              className="input"
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes("changed") ? "text-green-400" : "text-red-400"}`}>
              {pwMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn btn-secondary self-start"
          >
            Change password
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-4 text-red-400">Danger zone</h2>
        <div className="card p-6 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Log out</p>
              <p className="text-sm text-muted">Sign out of your account</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary text-red-400 border-red-400/20">
              Log out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
