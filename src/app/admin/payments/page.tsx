"use client";

export default function AdminPaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Payments</h1>
      <div className="card p-8 text-center">
        <p className="text-muted">
          Payment records are stored in the database. Use the admin users panel
          to manage subscriptions and credits. Full payment history will be
          available when a payment provider is configured.
        </p>
      </div>
    </div>
  );
}
