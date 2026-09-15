"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    price: "$9.99",
    credits: 500,
    priceCents: 999,
    features: ["500 credits/mo", "Text to Image", "Standard quality", "5 style presets"],
  },
  {
    name: "Creator",
    price: "$19.99",
    credits: 2000,
    priceCents: 1999,
    features: ["2,000 credits/mo", "All generation modes", "High quality", "All style presets", "Priority support"],
    popular: true,
  },
  {
    name: "Pro",
    price: "$49.99",
    credits: 10000,
    priceCents: 4999,
    features: ["10,000 credits/mo", "Everything in Creator", "Ultra quality", "Custom models", "Team access"],
  },
];

export default function DashboardPricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planName: string) {
    setLoading(planName);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
      }
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Pricing</h1>
      <p className="text-muted mb-8">Choose the plan that fits your creative workflow.</p>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card p-8 flex flex-col ${
              plan.popular ? "border-accent/50 relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge badge-accent text-xs">Most popular</span>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted text-sm">/month</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-accent text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.name.toLowerCase())}
              disabled={loading === plan.name.toLowerCase()}
              className={`btn w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
            >
              {loading === plan.name.toLowerCase()
                ? "Redirecting..."
                : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
