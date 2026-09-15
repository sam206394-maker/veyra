"use client";

import { useEffect, useState } from "react";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export default function CreditsPage() {
  const [credits, setCredits] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/credits").then((r) => r.json()),
    ]).then(([user, creditData]) => {
      setCredits(user.user?.credits ?? 0);
      setTransactions(creditData.transactions || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Credits</h1>

      <div className="card p-8 mb-8 text-center">
        <p className="text-sm text-muted mb-2">Available credits</p>
        <p className="text-5xl font-bold text-accent">{credits}</p>
        <p className="text-sm text-muted mt-2">
          Credits are used for each generation based on type and quality.
        </p>
      </div>

      <h2 className="font-semibold mb-4">Transaction history</h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No transactions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((t) => (
            <div key={t.id} className="card p-4 flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  t.amount > 0 ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t.description || t.type}</p>
                <p className="text-xs text-muted">
                  {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`text-sm font-mono font-semibold ${
                  t.amount > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {t.amount > 0 ? "+" : ""}
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
