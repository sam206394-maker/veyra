import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Veyra<span className="text-accent">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <Link href="/#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-lg font-bold">Veyra</span>
            <span className="text-accent">.</span>
            <p className="text-sm text-muted mt-1">Create without limits.</p>
          </div>
          <div className="flex gap-8 text-sm text-muted">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Veyra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
