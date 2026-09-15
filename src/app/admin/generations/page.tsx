"use client";

import { useEffect, useState } from "react";

interface Gen {
  id: string;
  type: string;
  prompt: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  user: { email: string };
}

export default function AdminGenerationsPage() {
  const [gens, setGens] = useState<Gen[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`/api/generations?limit=50&type=${filter}`)
      .then((r) => r.json())
      .then((d) => { setGens(d.generations || []); setLoading(false); });
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Generations</h1>
      <div className="flex gap-2 mb-4">
        {["all", "failed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn text-xs ${filter === f ? "btn-primary" : "btn-secondary"}`}>
            {f === "all" ? "All" : "Failed only"}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
      ) : gens.length === 0 ? (
        <p className="text-muted py-10 text-center">No generations</p>
      ) : (
        <div className="flex flex-col gap-2">
          {gens.map((g) => (
            <div key={g.id} className="card p-4 flex items-center gap-4">
              <span className={`badge ${g.status === "completed" ? "badge-green" : g.status === "failed" ? "badge-red" : "badge-yellow"}`}>{g.status}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{g.prompt}</p>
                <p className="text-xs text-muted">{g.user.email} · {g.type} · {g.creditsUsed} credits</p>
              </div>
              <span className="text-xs text-muted">{new Date(g.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
