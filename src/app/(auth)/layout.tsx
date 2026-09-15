import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Veyra<span className="text-accent">.</span>
          </Link>
        </div>
        <div className="card p-8">{children}</div>
      </div>
    </div>
  );
}
