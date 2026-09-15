"use client";

import { useEffect, useState, useMemo } from "react";

interface Generation {
  id: string;
  type: string;
  prompt: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  assets: Array<{ url: string }>;
}

export default function GenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const url = useMemo(() => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String((page - 1) * limit),
    });
    if (filter !== "all") params.set("type", filter);
    if (search) params.set("search", search);
    return `/api/generations?${params}`;
  }, [filter, search, page]);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setGenerations(d.generations || []);
          setTotal(d.total || 0);
        }
      });
    return () => { cancelled = true; };
  }, [url]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this generation?")) return;
    await fetch(`/api/generations/${id}`, { method: "DELETE" });
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Generations</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input md:w-64"
          placeholder="Search prompts..."
        />
        <div className="flex gap-2 overflow-x-auto">
          {["all", "text-to-image", "image-to-image", "text-to-video", "image-to-video"].map(
            (f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`btn text-xs whitespace-nowrap ${filter === f ? "btn-primary" : "btn-secondary"}`}
              >
                {f === "all" ? "All" : f}
              </button>
            )
          )}
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-4">No generations yet</p>
          <a href="/create" className="btn btn-primary">
            Start creating
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generations.map((g) => (
              <div key={g.id} className="card overflow-hidden">
                <div className="aspect-square bg-card-hover flex items-center justify-center">
                  <span className="text-3xl text-muted/30">✦</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium truncate mb-1">{g.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{g.type}</span>
                    <span
                      className={`badge text-xs ${
                        g.status === "completed"
                          ? "badge-green"
                          : g.status === "failed"
                          ? "badge-red"
                          : "badge-yellow"
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
