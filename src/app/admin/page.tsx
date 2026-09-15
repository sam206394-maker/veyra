"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  totalGenerations: number;
  totalPayments: number;
  failedGenerations: number;
  revenueCents: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then(setStats)
      .catch(() => setError("Access denied or failed to load stats"));
  }, []);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Users</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Generations</p>
          <p className="text-3xl font-bold">{stats.totalGenerations}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Payments</p>
          <p className="text-3xl font-bold">{stats.totalPayments}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-400">{stats.failedGenerations}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Revenue</p>
          <p className="text-3xl font-bold text-green-400">
            ${(stats.revenueCents / 100).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
