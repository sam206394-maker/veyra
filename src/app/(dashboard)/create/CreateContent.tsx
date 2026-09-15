"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";


const TABS = [
  { key: "text-to-image", label: "Text to Image", icon: "✦" },
  { key: "image-to-image", label: "Image to Image", icon: "◈" },
  { key: "text-to-video", label: "Text to Video", icon: "▶" },
  { key: "image-to-video", label: "Image to Video", icon: "◆" },
];

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
const QUALITIES = ["draft", "standard", "high"];
const STYLE_PRESETS = [
  "Photorealistic",
  "Cinematic",
  "Digital Art",
  "Oil Painting",
  "Watercolor",
  "Pixel Art",
  "Anime",
  "Minimalist",
  "Dark Moody",
  "Bright & Airy",
  "Vintage",
  "Futuristic",
];

interface GenerationResult {
  id: string;
  assets: Array<{ url: string; width?: number; height?: number }>;
}

interface Project {
  id: string;
  name: string;
}

export default function CreatePage() {
  const searchParams = useSearchParams();
  const searchType = searchParams.get("type");
  const [activeTab, setActiveTab] = useState(TABS.some((t) => t.key === searchType) ? searchType! : "text-to-image");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [quality, setQuality] = useState("standard");
  const [duration, setDuration] = useState(4);
  const [stylePreset, setStylePreset] = useState("");
  const [count, setCount] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setCredits(d.user?.credits ?? 0));
    fetch("/api/projects", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []));
    return () => controller.abort();
  }, []);
  


  const isVideo = activeTab.includes("video");

  const CREDIT_COSTS: Record<string, Record<string, number>> = {
    "text-to-image": { draft: 1, standard: 2, high: 5 },
    "image-to-image": { draft: 2, standard: 4, high: 8 },
    "text-to-video": { draft: 10, standard: 20, high: 50 },
    "image-to-video": { draft: 15, standard: 30, high: 75 },
  };

  const costPerUnit = CREDIT_COSTS[activeTab]?.[quality] ?? 2;
  const totalCost = isVideo ? costPerUnit * duration * count : costPerUnit * count;

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setError("");
    setGenerating(true);
    setStatus("queued");
    setResults(null);

    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || null,
          aspectRatio,
          quality,
          duration: isVideo ? duration : undefined,
          stylePreset: stylePreset || null,
          count,
          projectId: projectId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        setStatus("failed");
        return;
      }

      setStatus("processing");
      setResults(data.generation);
      setCredits(data.remainingCredits ?? credits);

      setTimeout(() => {
        setStatus("completed");
      }, 2000);
    } catch {
      setError("Network error");
      setStatus("failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create</h1>
          <p className="text-sm text-muted mt-1">
            {credits} credits remaining
          </p>
        </div>
        <span className="badge badge-accent">~{totalCost} credits</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn text-sm whitespace-nowrap ${
              activeTab === tab.key ? "btn-primary" : "btn-secondary"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Describe what you want to create..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Negative prompt <span className="text-muted">(optional)</span>
            </label>
            <input
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="input"
              placeholder="Things to avoid..."
            />
          </div>

          {isVideo && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Duration: {duration}s
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="btn btn-primary w-full py-3 text-base"
          >
            {generating
              ? "Generating..."
              : `Generate · ${totalCost} credits`}
          </button>
        </div>

        {/* Settings Panel */}
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <label className="block text-sm font-medium mb-1.5">Aspect ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar)}
                  className={`btn text-xs ${
                    aspectRatio === ar ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <label className="block text-sm font-medium mb-1.5">Quality</label>
            <div className="flex gap-2">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`btn text-xs flex-1 ${
                    quality === q ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <label className="block text-sm font-medium mb-1.5">
              Style preset
            </label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="input"
            >
              <option value="">None</option>
              {STYLE_PRESETS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="card p-4">
            <label className="block text-sm font-medium mb-1.5">
              Count: {count}
            </label>
            <input
              type="range"
              min={1}
              max={4}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {projects.length > 0 && (
            <div className="card p-4">
              <label className="block text-sm font-medium mb-1.5">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="input"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Status & Results */}
      {(status || results) && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "completed"
                  ? "bg-green-400"
                  : status === "failed"
                  ? "bg-red-400"
                  : "bg-yellow-400 animate-pulse-dot"
              }`}
            />
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>

          {results && status === "completed" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.assets.map((asset, i) => (
                <div
                  key={i}
                  className="card overflow-hidden group"
                >
                  <div className="aspect-square bg-card-hover flex items-center justify-center">
                    <span className="text-3xl text-muted/30">✦</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs text-muted">Result {i + 1}</span>
                    <a
                      href={asset.url}
                      download
                      className="text-xs text-accent hover:text-accent-light"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
