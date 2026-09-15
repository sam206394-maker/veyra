import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />
      <div
        className="orb w-[420px] h-[420px] -top-32 -left-24 bg-rose-600/20 animate-orb-drift"
        aria-hidden="true"
      />
      <div
        className="orb w-[360px] h-[360px] -bottom-24 -right-16 bg-amber-500/12 animate-orb-drift"
        style={{ animationDelay: "-6s" }}
        aria-hidden="true"
      />
      <div
        className="orb w-[280px] h-[280px] top-1/3 right-1/4 bg-accent/10 animate-float"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8 animate-fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-3xl font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            Veyra<span className="text-gradient">.</span>
          </Link>
          <p className="text-sm text-muted mt-1.5">Create without limits</p>
        </div>
        <div className="card-premium p-8 animate-fade-up animate-delay-1">
          {children}
        </div>
        <p className="text-center text-xs text-muted mt-6 animate-fade-up animate-delay-2">
          Protected by secure, encrypted sessions
        </p>
      </div>
    </div>
  );
}
