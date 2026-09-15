"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface Generation {
  id: string;
  type: string;
  prompt: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/generations?limit=5").then((r) => r.json()),
    ]).then(([userData, projectData, genData]) => {
      setUser(userData.user || null);
      setProjects(projectData.projects || []);
      setGenerations(genData.generations || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted mt-1">Here&apos;s your creative overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Credits remaining</p>
          <p className="text-3xl font-bold text-accent">{user?.credits ?? 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Projects</p>
          <p className="text-3xl font-bold">{projects.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Generations</p>
          <p className="text-3xl font-bold">{generations.length}</p>
        </div>
      </div>

      {/* Quick Create */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { type: "text-to-image", label: "Image", icon: "✦" },
          { type: "image-to-image", label: "Restyle", icon: "◈" },
          { type: "text-to-video", label: "Video", icon: "▶" },
          { type: "image-to-video", label: "Animate", icon: "◆" },
        ].map((item) => (
          <Link
            key={item.type}
            href={`/create?type=${item.type}`}
            className="card p-4 text-center hover:border-accent/30 transition-all group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent projects</h2>
            <Link href="/projects" className="text-sm text-accent hover:text-accent-light">
              View all
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted">No projects yet. Create one to get started.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Generations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent generations</h2>
            <Link href="/generations" className="text-sm text-accent hover:text-accent-light">
              View all
            </Link>
          </div>
          {generations.length === 0 ? (
            <p className="text-sm text-muted">No generations yet. Start creating!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {generations.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{g.prompt}</p>
                    <p className="text-xs text-muted">{g.type}</p>
                  </div>
                  <span
                    className={`badge ml-3 ${
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
