"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  _count: { generations: number };
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function fetchProjects() {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.projects || []);
        setLoading(false);
      });
  }

  useEffect(() => { fetchProjects(); }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setShowCreate(false);
      fetchProjects();
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    fetchProjects();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its generations?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary text-sm">
          New project
        </button>
      </div>

      {showCreate && (
        <div className="card p-4 mb-6 flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input flex-1"
            placeholder="Project name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate} className="btn btn-primary text-sm">
            Create
          </button>
          <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-sm">
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-4">No projects yet</p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-5 flex flex-col">
              {editingId === p.id ? (
                <div className="flex gap-2 mb-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input flex-1 text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleRename(p.id)}
                  />
                  <button onClick={() => handleRename(p.id)} className="btn btn-primary text-xs">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn btn-ghost text-xs">
                    Cancel
                  </button>
                </div>
              ) : (
                <h3 className="font-semibold mb-1">{p.name}</h3>
              )}
              <p className="text-sm text-muted mb-4 flex-1">
                {p._count.generations} generations
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => { setEditingId(p.id); setEditName(p.name); }}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
