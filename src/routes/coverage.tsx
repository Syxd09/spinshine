import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { useState } from "react";
import { LOCALITIES, RADIUS_KM } from "@/lib/booking";
import { SpotlightCard } from "@/components/site/SpotlightCard";

export const Route = createFileRoute("/coverage")({
  head: () => ({
    meta: [
      { title: "Service Areas & Coverage — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Check if your area in Bangalore is covered. SpinShine offers pickup and delivery within 30 km and on-site cleaning across the entire city.",
      },
      { property: "og:title", content: "Service Area Coverage — SpinShine" },
      {
        property: "og:description",
        content: "Locality coverage checker for SpinShine pickup and on-site cleaning in Bangalore.",
      },
      { property: "og:url", content: "/coverage" },
    ],
    links: [{ rel: "canonical", href: "/coverage" }],
  }),
  component: CoveragePage,
});

function CoveragePage() {
  const [selectedLocality, setSelectedLocality] = useState("");
  const [checked, setChecked] = useState(false);

  const loc = LOCALITIES.find((l) => l.name === selectedLocality);
  const inside = loc ? loc.km <= RADIUS_KM : false;

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
                Service Boundaries
              </span>
              <h1 className="mt-4 text-5xl sm:text-6.5xl lg:text-7.5xl font-black tracking-tight leading-none">
                Bangalore <span className="font-serif italic font-semibold text-teal-400">coverage.</span>
              </h1>
              <p className="mt-6 mx-auto max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed">
                We operate within a 30 km pickup and delivery radius from our central care hub. For locations outside this radius, our on-site cleaning units are still available to travel directly to you.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Coverage Checker & Radar Map */}
        <section className="mx-auto max-w-5xl px-6 py-28 bg-grid-pattern relative">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="grid gap-16 lg:grid-cols-2 items-center relative">
            
            {/* Checker Card */}
            <div className="space-y-6">
              <Reveal>
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-royal bg-royal/10 px-3 py-1 rounded-full uppercase">
                    Verification Tool
                  </span>
                  <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Locality Checker</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Check if your address qualifies for pickup & delivery or on-site cleaning.
                  </p>
                </div>
              </Reveal>

              <SpotlightCard
                glowColor="rgba(20, 184, 166, 0.12)"
                borderColor="rgba(110, 68, 255, 0.22)"
                className="shadow-lift"
                innerClassName="p-8 space-y-6"
              >
                <div className="space-y-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                    Select Your Locality
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => {
                      setSelectedLocality(e.target.value);
                      setChecked(true);
                    }}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="" className="font-semibold text-muted-foreground">Choose an area...</option>
                    {LOCALITIES.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                {checked && loc && (
                  <div
                    className={`reveal rounded-2xl border p-5 text-sm transition-all duration-300 ${
                      inside
                        ? "border-teal/40 bg-teal/5 text-foreground"
                        : "border-royal/40 bg-royal/5 text-foreground"
                    }`}
                  >
                    {inside ? (
                      <div className="space-y-2">
                        <p className="font-extrabold text-teal flex items-center gap-2 text-sm uppercase tracking-wider">
                          <span>✓</span> Full Pickup & Return Coverage
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Great! **{loc.name}** is **{loc.km} km** from our hub, which is within our **{RADIUS_KM} km** radius. Both pickup & return and on-site cleaning are fully supported!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-extrabold text-royal flex items-center gap-2 text-sm uppercase tracking-wider">
                          <span>🏠</span> On-site Services Supported Only
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          **{loc.name}** is **{loc.km} km** from our hub. This is outside our **{RADIUS_KM} km** pickup zone, but our mobile teams can still perform **on-site curtain, carpet, mattress, and sofa cleaning** directly at your home!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    to="/book"
                    className="block text-center rounded-full bg-navy-gradient py-4 text-xs font-bold tracking-wider uppercase text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    Book a Pickup
                  </Link>
                </div>
              </SpotlightCard>
            </div>

            {/* Radar Animation Map Visual */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-navy-gradient shadow-lift border border-border">
              {/* Radial backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.546_0.215_262.881/0.3),transparent_62%)]" />
              <div className="absolute inset-0 bg-grid-pattern-dark opacity-15" />
              
              {/* Sonar sweep line spinning */}
              <div className="absolute top-1/2 left-1/2 w-[50%] h-[1.5px] bg-gradient-to-r from-teal to-transparent origin-left -translate-y-1/2 animate-slow-spin" />
              
              {/* Radar Rings */}
              <div className="absolute top-1/2 left-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/20 bg-teal/5 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/40 bg-teal/10" />
              <div className="absolute top-1/2 left-1/2 h-[25%] w-[25%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/60 bg-teal/15" />
              
              {/* Hub Dot */}
              <div className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_0_12px_oklch(0.704_0.14_182.503/0.35)]" />
              
              <span className="absolute bottom-6 left-6 text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
                {RADIUS_KM} km pickup radius · Bengaluru
              </span>
            </div>

          </div>
        </section>

        {/* Directory List of local areas */}
        <section className="bg-card border-t border-border py-28 px-6 relative overflow-hidden bg-grid-pattern">
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-royal/5 rounded-full blur-3xl" />
          <div className="mx-auto max-w-5xl space-y-6 relative">
            <Reveal>
              <h2 className="text-3xl font-extrabold text-foreground text-center tracking-tight">Locality Availability Directory</h2>
              <p className="text-sm text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
                A complete list of distances and service eligibility for major Bangalore areas.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {LOCALITIES.sort((a,b) => a.name.localeCompare(b.name)).map((l) => {
                const inZone = l.km <= RADIUS_KM;
                return (
                  <Reveal key={l.name}>
                    <SpotlightCard className="p-px hover:shadow-soft" innerClassName="p-5 flex justify-between items-center text-sm bg-card">
                      <div>
                        <span className="font-bold text-foreground">{l.name}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{l.km} km from hub</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                          inZone
                            ? "bg-teal/10 text-teal-700"
                            : "bg-royal/10 text-royal"
                        }`}
                      >
                        {inZone ? "Full Coverage" : "On-site"}
                      </span>
                    </SpotlightCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
