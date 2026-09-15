import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-lg font-bold">
              Veyra<span className="text-accent">.</span>
            </Link>
            <span className="badge badge-accent">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-muted hover:text-foreground">Overview</Link>
            <Link href="/admin/users" className="text-muted hover:text-foreground">Users</Link>
            <Link href="/admin/generations" className="text-muted hover:text-foreground">Generations</Link>
            <Link href="/admin/payments" className="text-muted hover:text-foreground">Payments</Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
