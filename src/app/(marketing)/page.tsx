import Link from "next/link";

const FEATURES = [
  {
    title: "Text to Image",
    description: "Generate stunning images from text prompts with multiple style presets and aspect ratios.",
    icon: "✦",
  },
  {
    title: "Image to Image",
    description: "Transform existing images with AI — restyle, enhance, or reimagine your visuals.",
    icon: "◈",
  },
  {
    title: "Text to Video",
    description: "Create short video clips from text descriptions. Perfect for social content and ads.",
    icon: "▶",
  },
  {
    title: "Image to Video",
    description: "Bring static images to life with subtle motion and cinematic effects.",
    icon: "◆",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "$9.99",
    period: "/month",
    credits: "500 credits/mo",
    features: ["Text to Image", "Standard quality", "5 style presets", "Email support"],
    cta: "Start creating",
  },
  {
    name: "Creator",
    price: "$19.99",
    period: "/month",
    credits: "2,000 credits/mo",
    features: ["All generation modes", "High quality", "All style presets", "Priority support", "API access"],
    cta: "Go pro",
    popular: true,
  },
  {
    name: "Pro",
    price: "$49.99",
    period: "/month",
    credits: "10,000 credits/mo",
    features: ["Everything in Creator", "Ultra quality", "Custom models", "Dedicated support", "Team access"],
    cta: "Scale up",
  },
];

const TESTIMONIALS = [
  {
    quote: "Veyra replaced three tools in my workflow. The quality is incredible for the price.",
    name: "Sarah Chen",
    role: "Independent Filmmaker",
  },
  {
    quote: "I create social content for 12 clients. Veyra saves me hours every week.",
    name: "Marcus Rivera",
    role: "Social Media Manager",
  },
  {
    quote: "The image-to-video feature alone is worth the subscription. Game changer.",
    name: "Anika Patel",
    role: "Digital Artist",
  },
];

const FAQ = [
  {
    q: "What are credits?",
    a: "Credits are used each time you generate content. Different generation modes and quality levels use different amounts of credits. Your plan includes a monthly credit allotment.",
  },
  {
    q: "Can I switch plans?",
    a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free tier?",
    a: "New accounts receive 100 free credits to try the platform. No credit card required to start.",
  },
  {
    q: "What AI models do you use?",
    a: "We abstract the underlying AI provider, so you get consistent quality regardless. Enterprise plans can bring their own model endpoints.",
  },
  {
    q: "Do you store my generated images?",
    a: "Generated assets are stored securely and are only accessible by you. You can delete them at any time from your dashboard.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40 text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-light bg-accent-dim px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-dot" />
            Now in open beta
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6">
            Create without
            <br />
            <span className="text-accent">limits</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
            An affordable AI creative studio for image and video generation.
            Built for creators who demand quality without breaking the bank.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn btn-primary text-base px-8 py-3">
              Get started free
            </Link>
            <Link href="/#features" className="btn btn-secondary text-base px-8 py-3">
              Explore features
            </Link>
          </div>
        </div>
      </section>

      {/* Example Creative Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-card border border-border overflow-hidden hover:border-border/60 transition-all group"
            >
              <div className="w-full h-full bg-gradient-to-br from-card via-card-hover to-card flex items-center justify-center">
                <span className="text-4xl text-muted/30 group-hover:text-accent/40 transition-colors">
                  ✦
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to create
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Four powerful generation modes, all from one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-8 group">
                <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-accent text-xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace Teaser */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Your creative workspace
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto mb-8">
              Organize projects, track generations, manage credits — everything in one clean interface.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">4</div>
                <div className="text-xs text-muted mt-1">Generation modes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">12+</div>
                <div className="text-xs text-muted mt-1">Style presets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">∞</div>
                <div className="text-xs text-muted mt-1">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan) => (
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
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-accent mt-1">{plan.credits}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted text-sm">{plan.period}</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted">
                      <span className="text-accent text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`btn w-full ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Trusted by creators
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-8">
                <p className="text-muted leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="card p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to create?
          </h2>
          <p className="text-muted text-lg mb-8">
            Join thousands of creators using Veyra to bring their ideas to life.
          </p>
          <Link href="/signup" className="btn btn-primary text-base px-10 py-3">
            Start for free
          </Link>
        </div>
      </section>
    </div>
  );
}
