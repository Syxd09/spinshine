import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SERVICES } from "@/lib/booking";
import { cmsImages } from "@/lib/cms-config";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Fabric Care Services — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Explore professional curtain, carpet, sofa, mattress, and upholstery cleaning services in Bangalore. Meticulous care with fabric-specific methods.",
      },
      { property: "og:title", content: "Fabric Care Services — SpinShine" },
      {
        property: "og:description",
        content: "High-end cleaning for curtains, carpets, blankets, mattresses, and sofas in Bangalore.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const defaultProcesses: Record<string, string[]> = {
  curtains: [
    "Unhooking & Inspection: Our technician carefully unhooks your curtains and documents any existing wear.",
    "Fabric-Specific Wash: Gentle solvent dry cleaning for silk/velvet, or deep hydration washing for cotton/linens.",
    "Steam Pressing: Industrial pressing to remove all wrinkles and sanitize the fibers.",
    "Delivery & Rehanging: Rehung perfectly on your tracks, steamed once more on-site for a pristine drop."
  ],
  carpet: [
    "Deep Beating & Vacuuming: High-power vacuuming to extract dry soil embedded deep within the carpet pile.",
    "Stain Pre-treatment: Specialized enzyme treatments for pet spots, red wine, tea, and heavy traffic lanes.",
    "Hot-water Extraction: Injection of eco-friendly shampoo followed by high-suction water extraction.",
    "Deodorization & Drying: pH-balancing rinse with dual-motor blowers leaving it fresh and dry within hours."
  ],
  sofa: [
    "Fabric Assessment: Checking colorfastness and testing cleaner pH compatibility.",
    "Foam Shampooing: Injection of micro-split foam that encapsulates dirt without over-soaking structural frames.",
    "Deep Jet Extraction: High-pressure extraction pulling out dissolved sweat, oils, and allergens.",
    "Conditioning: Fiber softeners applied for plush texture restoration."
  ],
  mattress: [
    "UV-C Sterilization: Destruction of dust mites, bedbugs, bacteria, and spores at a DNA level.",
    "Steam Deep Sanitization: Injection of 140°C dry steam to lift sweat stains and body oils.",
    "Extraction & Suction: Powerful vacuum extraction pulling out dissolved debris and moisture.",
    "Anti-allergen Spray: Hypoallergenic shield spray to retard future dust mite colonization."
  ],
  blanket: [
    "Inspection & Tagging: Barcoded tracking to ensure your luxury bedding is kept isolated and safe.",
    "Sanitizing Soft Wash: Large-drum washing using hypoallergenic detergents that preserve loft and warmth.",
    "Low-temp Tumble Drying: Slow drying at precise temperatures to prevent shrinkage of wool/down fill.",
    "Antibacterial Packaging: Sealed in breathable protective bags, ready to store or use."
  ],
  upholstery: [
    "Vacuum extraction of dust from crevices and fabric folds.",
    "Targeted stain removal for food spills, ink, and pet residue.",
    "Fabric shampooing and mechanical agitation using soft brushes.",
    "Final hot-water extraction and alignment of pile fibers."
  ]
};

function ServicesPage() {
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
                Artisanal Fabric Care
              </span>
              <h1 className="mt-4 text-5xl sm:text-6.5xl lg:text-7.5xl font-black tracking-tight leading-none">
                Premium care for <span className="font-serif italic font-semibold text-teal-400">every fabric.</span>
              </h1>
              <p className="mt-6 mx-auto max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed">
                We believe different materials require custom chemistry and techniques. From delicate silk panels to heavy wool rugs, we treat nothing as generic laundry.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Services Detail List */}
        <section className="mx-auto max-w-5xl px-6 py-28 bg-grid-pattern relative">
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="space-y-32">
            {SERVICES.map((s, idx) => {
              const serviceImg = cmsImages[s.key as keyof typeof cmsImages] || cmsImages.curtains;
              const workflow = defaultProcesses[s.key] || [
                "Inspection: Standard fabric testing and inspection.",
                "Cleaning: Gentle wash or shampoo extraction.",
                "Finishing: Natural drying and pressing.",
                "Delivery: Quality checked packaging and delivery."
              ];
              const isEven = idx % 2 === 0;

              return (
                <Reveal key={s.key}>
                  <div
                    id={s.key}
                    className={`grid gap-16 lg:grid-cols-2 items-center ${
                      isEven ? "" : "lg:grid-flow-row-dense"
                    }`}
                  >
                    <div className={`${isEven ? "lg:order-1" : "lg:order-2"} space-y-6`}>
                      <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-royal bg-royal/10 px-3 py-1 rounded-full uppercase">
                        Service Profile
                      </span>
                      <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{s.name}</h2>
                      
                      <div className="p-4 rounded-xl border border-gold/20 bg-card inline-flex items-center gap-2.5 shadow-soft relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gold">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Base Tariff:</span>
                        <span className="font-display text-xl font-black text-royal">₹{s.rate}</span>
                        <span className="text-xs text-muted-foreground">/ {s.unit}</span>
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {s.desc}
                      </p>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">
                          Treatment Workflow:
                        </h3>
                        <ul className="space-y-3.5">
                          {workflow.map((step, sIdx) => {
                            const [title, desc] = step.split(": ");
                            return (
                              <li key={sIdx} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-3">
                                <span className="text-teal font-extrabold mt-0.5">✓</span>
                                <div>
                                  {desc ? (
                                    <>
                                      <strong className="text-foreground font-semibold">{title}:</strong> {desc}
                                    </>
                                  ) : (
                                    step
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="pt-6">
                        <Link
                          to="/book"
                          search={{ service: s.key }}
                          className="relative inline-flex items-center justify-center overflow-hidden rounded-full p-0.5 font-bold group shadow-lift hover:shadow-glow transition-all"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-teal via-royal to-gold rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />
                          <span className="relative block px-6 py-2.5 text-xs font-bold bg-white text-navy rounded-full transition-colors group-hover:bg-transparent group-hover:text-white">
                            Book {s.name}
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className={`overflow-hidden rounded-3xl border border-border/80 bg-card p-2 shadow-soft relative group ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}>
                      <div className="absolute inset-2 bg-navy/10 z-10 transition-opacity group-hover:opacity-0 pointer-events-none rounded-[20px]" />
                      <img
                        src={serviceImg}
                        alt={`${s.name} process`}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] rounded-[20px]"
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-card border-t border-border py-28 px-6 text-center relative overflow-hidden bg-grid-pattern">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-royal/5 rounded-full blur-3xl" />
          <div className="mx-auto max-w-2xl space-y-6 relative">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Restore your home's hygiene</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Schedule your pick-up or on-site cleaning service. Instant availability, flexible slots, and no upfront payments.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link
                  to="/book"
                  className="rounded-full bg-navy-gradient px-8 py-4 text-xs font-bold tracking-wider uppercase text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Schedule Pickup
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full border border-border px-8 py-4 text-xs font-bold tracking-wider uppercase text-foreground transition-colors hover:bg-secondary"
                >
                  Check Pricing
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
