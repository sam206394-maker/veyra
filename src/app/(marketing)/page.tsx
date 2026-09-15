import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";

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

const EXAMPLES = [
  {
    label: "Cinematic portrait",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80&auto=format&fit=crop",
    type: "Image",
  },
  {
    label: "Neon cityscape",
    img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=80&auto=format&fit=crop",
    type: "Video",
  },
  {
    label: "Product still",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop",
    type: "Image",
  },
  {
    label: "Surreal landscape",
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format&fit=crop",
    type: "Image → Video",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden="true" />
        <div
          className="orb w-[520px] h-[520px] -top-40 -left-32 bg-rose-600/16 animate-orb-drift"
          aria-hidden="true"
        />
        <div
          className="orb w-[440px] h-[440px] top-10 -right-28 bg-amber-500/10 animate-orb-drift"
          style={{ animationDelay: "-8s" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-32 md:pb-40 text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-light bg-accent-dim px-3 py-1.5 rounded-full mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-dot" />
            Now in open beta
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] mb-6 animate-fade-up animate-delay-1">
            Create without
            <br />
            <span className="text-gradient">limits</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 animate-fade-up animate-delay-2">
            An affordable AI creative studio for image and video generation.
            Built for creators who demand quality without breaking the bank.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-3">
            <Link href="/signup" className="btn btn-primary text-base px-8 py-3 btn-shine hover-lift">
              Get started free
            </Link>
            <Link
              href="/#features"
              className="btn btn-secondary text-base px-8 py-3 hover-lift"
            >
              Explore features
            </Link>
          </div>
        </div>
      </section>

      {/* Example Creative Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {EXAMPLES.map((ex, i) => (
            <FadeIn key={ex.label} delay={i * 90}>
              <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border-subtle hover-lift">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote demo placeholders */}
                <img
                  src={ex.img}
                  alt={ex.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="badge badge-accent glass text-[10px]">{ex.type}</span>
                </div>
                <p className="absolute bottom-3 left-4 right-4 text-sm font-medium text-white/90">
                  {ex.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to create
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Four powerful generation modes, all from one platform.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={(i % 2) * 100}>
                <div className="card p-8 group hover-lift">
                  <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-accent text-xl mb-5 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted leading-relaxed">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace Teaser */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="card-premium p-12 md:p-16 text-center relative overflow-hidden">
              <div
                className="orb w-[300px] h-[300px] -top-24 -right-16 bg-rose-600/12 animate-float"
                aria-hidden="true"
              />
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 relative">
                Your creative workspace
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto mb-10 relative">
                Organize projects, track generations, manage credits — everything in one clean
                interface.
              </p>
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto relative">
                <div>
                  <div className="text-4xl font-bold text-gradient">4</div>
                  <div className="text-xs text-muted mt-1">Generation modes</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">12+</div>
                  <div className="text-xs text-muted mt-1">Style presets</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient">∞</div>
                  <div className="text-xs text-muted mt-1">Projects</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 100}>
                <div
                  className={`card p-8 flex flex-col h-full hover-lift ${
                    plan.popular ? "border-accent/50 relative card-premium" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
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
                        <span className="text-accent">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`btn w-full ${
                      plan.popular ? "btn-primary btn-shine" : "btn-secondary"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Loved by creators
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Placeholder testimonials — add real creator stories here.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="card p-8 h-full hover-lift">
                  <div className="flex gap-1 text-accent mb-4" aria-label="5 stars">
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j} className="text-sm">{s}</span>
                    ))}
                  </div>
                  <p className="text-muted leading-relaxed mb-6">“{t.quote}”</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-dim text-accent flex items-center justify-center font-semibold text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Frequently asked questions
            </h2>
          </FadeIn>
          <div className="flex flex-col gap-4">
            {FAQ.map((item, i) => (
              <FadeIn key={item.q} delay={i * 60}>
                <details className="card p-6 group">
                  <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-muted text-lg transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-muted leading-relaxed mt-3">{item.a}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border-subtle relative overflow-hidden">
        <div
          className="orb w-[380px] h-[380px] bottom-0 left-1/2 -translate-x-1/2 bg-rose-600/12 animate-float"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to create?
            </h2>
            <p className="text-muted text-lg mb-8">
              Join thousands of creators using Veyra to bring their ideas to life.
            </p>
            <Link href="/signup" className="btn btn-primary text-base px-10 py-3 btn-shine hover-lift">
              Start for free
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
