import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useState } from "react";
import { useCatalog } from "@/lib/catalog-state";
import { SpotlightCard } from "@/components/site/SpotlightCard";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Rates — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Transparent pricing for curtain, carpet, sofa, mattress, and blanket cleaning in Bangalore. Check rates, try our price estimator, and get a quote.",
      },
      { property: "og:title", content: "Transparent Pricing — SpinShine" },
      {
        property: "og:description",
        content:
          "Upfront pricing for fabric care services in Bangalore. Estimate your total cost in real-time.",
      },
      { property: "og:url", content: "/pricing" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { services, settings } = useCatalog();
  const [selectedService, setSelectedService] = useState<string>(services[0]?.key || "curtains");
  const [quantity, setQuantity] = useState(5);
  const [mode, setMode] = useState<"pickup" | "onsite">("pickup");

  const activeSvc = services.find((s) => s.key === selectedService)!;
  const estimatedPrice =
    (activeSvc ? activeSvc.rate * Math.max(1, quantity) : 0) +
    (mode === "onsite" ? settings.onsiteFee : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-navy-gradient text-white py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern-dark opacity-25" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal/10 rounded-full blur-3xl" />
          <div className="mx-auto max-w-5xl text-center space-y-6 relative">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4.5 py-1.5 text-xs font-bold tracking-[0.25em] text-teal uppercase">
                Upfront Tariff
              </span>
              <h1 className="mt-4 text-5xl sm:text-6.5xl lg:text-7.5xl font-black tracking-tight leading-none">
                Transparent{" "}
                <span className="font-serif italic font-semibold text-teal-400">pricing.</span>
              </h1>
              <p className="mt-6 mx-auto max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed">
                We believe in complete transparency. Every pricing detail is quoted upfront before
                we collect or begin cleaning. No hidden fees or surprise taxes.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Pricing & Estimator */}
        <section className="mx-auto max-w-5xl px-6 py-28 bg-grid-pattern relative">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] items-start relative">
            {/* Tariff Grid */}
            <div className="space-y-8">
              <Reveal>
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-royal bg-royal/10 px-3 py-1 rounded-full uppercase">
                    Tariff Sheet
                  </span>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                    Standard Service Rates
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our standard rates structured by service and fabric unit. Final counts are
                    always confirmed on-site before tag application.
                  </p>
                </div>
              </Reveal>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Base Rate</th>
                      <th className="px-6 py-4">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {services.map((s) => (
                      <tr key={s.key} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-5 font-semibold text-foreground">{s.name}</td>
                        <td className="px-6 py-5 font-display font-extrabold text-royal text-base">
                          ₹{s.rate}
                        </td>
                        <td className="px-6 py-5 text-xs text-muted-foreground">{s.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rate inclusions */}
              <div className="p-6 rounded-2xl border border-border bg-secondary/20 space-y-4">
                <h3 className="font-bold text-foreground text-xs uppercase tracking-widest">
                  Included in our base rate:
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="text-teal font-extrabold text-sm">✓</span>
                    <span>Free curtain unhooking & rehanging</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-teal font-extrabold text-sm">✓</span>
                    <span>Eco-friendly pH-balanced conditioners</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-teal font-extrabold text-sm">✓</span>
                    <span>Minor spot & soil treatments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-teal font-extrabold text-sm">✓</span>
                    <span>2-stage quality checks & safety wrap</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Price Estimator (Apple-Style) using SpotlightCard */}
            <SpotlightCard
              glowColor="rgba(20, 184, 166, 0.12)"
              borderColor="rgba(110, 68, 255, 0.22)"
              className="lg:sticky lg:top-24 shadow-lift"
              innerClassName="p-8 space-y-8"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest text-teal bg-teal/10 px-2.5 py-0.5 rounded-full uppercase">
                  Configurator
                </span>
                <h2 className="text-xl font-black text-foreground">Estimate Calculator</h2>
                <p className="text-xs text-muted-foreground">
                  Estimate cost in real-time based on your quantity.
                </p>
              </div>

              <div className="space-y-6">
                {/* Select Service */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    Select Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    {services.map((s) => (
                      <option key={s.key} value={s.key} className="font-semibold">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enter Quantity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      Quantity ({activeSvc.unit}s)
                    </label>
                    <span className="font-display text-lg font-black text-royal">{quantity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-royal"
                  />
                  <div className="flex justify-between text-[9px] font-semibold text-muted-foreground">
                    <span>1 {activeSvc.unit}</span>
                    <span>50 {activeSvc.unit}s</span>
                  </div>
                </div>

                {/* Choose Mode */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    Service Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMode("pickup")}
                      className={`rounded-xl border py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                        mode === "pickup"
                          ? "border-royal bg-royal/10 text-royal shadow-soft"
                          : "border-border hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      Pickup
                    </button>
                    <button
                      onClick={() => setMode("onsite")}
                      className={`rounded-xl border py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                        mode === "onsite"
                          ? "border-royal bg-royal/10 text-royal shadow-soft"
                          : "border-border hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      On-site
                    </button>
                  </div>
                  {mode === "onsite" && (
                    <p className="text-[9px] leading-relaxed text-muted-foreground">
                      * Includes a flat ₹{settings.onsiteFee} transport and machinery deployment
                      charge.
                    </p>
                  )}
                </div>
              </div>

              {/* Estimate Output */}
              <div className="border-t border-border/80 pt-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Estimated Total:
                  </span>
                  <span className="text-4xl font-extrabold font-display text-foreground bg-gradient-to-r from-royal via-teal to-gold bg-clip-text text-transparent">
                    ₹{estimatedPrice}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  * This estimate is illustrative. Final measurements and inspection are completed
                  on-site by our technician before tags are applied.
                </p>
                <Link
                  to="/book"
                  className="block text-center rounded-full bg-navy-gradient py-4 text-xs font-bold tracking-wider uppercase text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Configure & Book
                </Link>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* Payment Policy section */}
        <section className="bg-card border-t border-border py-28 px-6 relative overflow-hidden bg-grid-pattern">
          <div className="absolute top-1/4 -right-24 w-80 h-80 bg-royal/5 rounded-full blur-3xl" />
          <div className="mx-auto max-w-5xl text-center space-y-6 relative">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4.5 py-1.5 text-xs font-bold tracking-[0.25em] text-teal uppercase">
                Payment Flexibility
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Flexible Payment Options
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                We make transactions effortless. Pay securely after service completion and check
                your final items before making a payment.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
              <Reveal delay={60}>
                <SpotlightCard
                  className="h-full flex flex-col justify-between text-left"
                  innerClassName="p-8 space-y-4"
                >
                  <span className="text-2xl">📱</span>
                  <h3 className="font-bold text-foreground text-sm">UPI Payments</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Pay instantly via Google Pay, PhonePe, Paytm, or BHIM using our technician's
                    secure dynamic QR code scanner.
                  </p>
                </SpotlightCard>
              </Reveal>

              <Reveal delay={120}>
                <SpotlightCard
                  className="h-full flex flex-col justify-between text-left"
                  innerClassName="p-8 space-y-4"
                >
                  <span className="text-2xl">💳</span>
                  <h3 className="font-bold text-foreground text-sm">Credit & Debit Cards</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We accept Visa, Mastercard, RuPay, and American Express. Technicians carry
                    portable wireless POS terminals.
                  </p>
                </SpotlightCard>
              </Reveal>

              <Reveal delay={180}>
                <SpotlightCard
                  className="h-full flex flex-col justify-between text-left"
                  innerClassName="p-8 space-y-4"
                >
                  <span className="text-2xl">💵</span>
                  <h3 className="font-bold text-foreground text-sm">Cash on Delivery</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Prefer cash? You can pay the exact invoice amount in cash to the technician
                    after checking the final delivery.
                  </p>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
