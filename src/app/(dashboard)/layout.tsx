"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "◈" },
  { href: "/create", label: "Create", icon: "✦" },
  { href: "/projects", label: "Projects", icon: "◧" },
  { href: "/generations", label: "Generations", icon: "▶" },
  { href: "/credits", label: "Credits", icon: "◉" },
  { href: "/pricing", label: "Pricing", icon: "◇" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

function DemoBadge() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;
  return (
    <div className="px-3 py-2 mb-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg text-center">
      Demo Mode
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-border-subtle">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight">
            Veyra<span className="text-accent">.</span>
          </Link>
        </div>
        <DemoBadge />
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "active"
                  : ""
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border-subtle">
          <Link href="/" className="sidebar-link">
            <span className="text-base w-5 text-center">←</span>
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-border-subtle h-14 flex items-center px-4 gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-ghost p-2"
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/dashboard" className="text-lg font-bold">
            Veyra<span className="text-accent">.</span>
          </Link>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
