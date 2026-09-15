"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  createdAt: string;
  _count: { generations: number; payments: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then((d) => { setUsers(d.users || []); setLoading(false); })
      .catch(() => { setError("Access denied"); setLoading(false); });
  }, []);

  async function adjustCredits(userId: string, amount: number) {
    const desc = prompt(`Adjustment amount (${amount > 0 ? "+" : ""}${amount}):`);
    if (desc === null) return;
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "adjust_credits", userId, amount, description: desc }),
    });
    window.location.reload();
  }

  async function disableUser(userId: string) {
    if (!confirm("Disable this user?")) return;
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable_user", userId }),
    });
    window.location.reload();
  }

  if (error) return <p className="text-red-400 py-20 text-center">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Users</h1>
      {loading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Credits</th>
                <th className="p-3 text-right">Gens</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border-subtle">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 text-muted">{u.name || "—"}</td>
                  <td className="p-3"><span className={`badge ${u.role === "admin" ? "badge-accent" : u.role === "disabled" ? "badge-red" : "badge-green"}`}>{u.role}</span></td>
                  <td className="p-3 text-right font-mono">{u.credits}</td>
                  <td className="p-3 text-right text-muted">{u._count.generations}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => adjustCredits(u.id, 100)} className="text-xs text-green-400 hover:text-green-300">+100</button>
                    <button onClick={() => adjustCredits(u.id, -100)} className="text-xs text-yellow-400 hover:text-yellow-300">-100</button>
                    {u.role !== "disabled" && (
                      <button onClick={() => disableUser(u.id)} className="text-xs text-red-400 hover:text-red-300">Disable</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
