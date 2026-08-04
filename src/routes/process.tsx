import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Our Process — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Discover how SpinShine cares for your fabrics. Detail of our step-by-step wet/dry cleaning, sanitizing, quality checks, and tracking workflows.",
      },
      { property: "og:title", content: "Our Process — SpinShine" },
      {
        property: "og:description",
        content:
          "Learn how we unhook, collect, clean, press, inspect, and rehang your fabrics in Bangalore.",
      },
      { property: "og:url", content: "/process" },
    ],
    links: [{ rel: "canonical", href: "/process" }],
  }),
  component: ProcessPage,
});

const steps = [
  {
    num: "01",
    title: "Instant Booking",
    desc: "Schedule everything in 60 seconds. Choose whether you need convenient door-to-door pickup or on-site cleaning, select a 2-hour date/time slot, and receive instant SMS/email confirmation with your order reference.",
  },
  {
    num: "02",
    title: "Technician Inspection & Pickup",
    desc: "A uniformed, trained technician arrives. For curtains, they unhook them from rails, pelmets, or rings. Every item is inspected for stains, tears, and material health, tagged with a unique barcode, and securely packed.",
  },
  {
    num: "03",
    title: "Facility Ingestion & Sorting",
    desc: "At our dust-controlled fabric care facility, items are scanned, photographed, and sorted by fiber type (silk, linen, cotton, synthetics) and coloration to ensure specialized treatment batching.",
  },
  {
    num: "04",
    title: "Fabric-Matched Cleaning",
    desc: "We use state-of-the-art Italian cleaning machines. Silks undergo eco-friendly solvent-based delicate dry cleaning; cottons and rugs receive deep hot-water extraction; woolens undergo neutral-pH wet cleaning. Zero harsh chlorine bleaching.",
  },
  {
    num: "05",
    title: "Controlled De-humidification & Drying",
    desc: "Fabrics are dried in climate-regulated drying chambers. This avoids the structural damage and color fading caused by direct sunlight or high-heat commercial dryers.",
  },
  {
    num: "06",
    title: "Steam Pressing & 2-Stage QC",
    desc: "Curtains and linens are steam-pressed using industrial tension tables to restore drape and fold memory. Every item passes through double-inspection under high-lux lighting to check for spot removal and fiber integrity.",
  },
  {
    num: "07",
    title: "Eco-Protection Wrapping & Rehanging",
    desc: "We deliver items back pressed and packaged in breathable, dust-proof bags. For curtains, our technician returns and rehanges each panel, aligning hooks and tracks to leave your home completely refreshed.",
  },
];

function ProcessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Hero Section */}
        <section className="bg-navy-gradient text-white py-20 px-6">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <span className="text-xs font-semibold tracking-[0.2em] text-teal uppercase">
                The Science of Fabric Care
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Our 7-Step Cleaning Pipeline.
              </h1>
              <p className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-white/70">
                From the moment we collect your fabrics to their pristine return, every step is
                governed by fabric-matched chemistry, high-end machines, and meticulous detail.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="relative border-l border-border pl-8 space-y-16">
            {steps.map((s, idx) => (
              <Reveal key={idx}>
                <div className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[50px] top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-navy-gradient text-white font-display font-bold text-sm shadow-lift border-4 border-background">
                    {s.num}
                  </span>

                  <div>
                    <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Process Highlights / Standards */}
        <section className="bg-card border-y border-border py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-semibold tracking-[0.2em] text-royal uppercase">
                  Our Standards
                </span>
                <h2 className="mt-2 text-3xl font-extrabold text-foreground">
                  Premium facility. Eco-friendly solutions.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground">
                  Our service standards protect both your expensive home furnishing investments and
                  the environment.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Reveal delay={60}>
                <div className="surface p-8 rounded-2xl h-full space-y-3">
                  <span className="text-2xl">🌱</span>
                  <h3 className="font-bold text-foreground">Zero Harmful Solvents</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We completely avoid PERC (perchloroethylene) dry cleaning. Instead, we use
                    biodegradable, dermatologically tested, organic siloxane solvents that are safe
                    for infants, pets, and delicate skin.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="surface p-8 rounded-2xl h-full space-y-3">
                  <span className="text-2xl">🌀</span>
                  <h3 className="font-bold text-foreground">Damp & Shrinkage Prevention</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Fabric fibers warp under heat. Our dehumidified chambers dry garments under
                    ambient pressure and mild warmth, ensuring wool, cashmere, and high-pile carpets
                    maintain original dimensions.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="surface p-8 rounded-2xl h-full space-y-3">
                  <span className="text-2xl">🔍</span>
                  <h3 className="font-bold text-foreground">Real-Time Tracking</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Every step in the cleaning pipeline is logged via barcodes. You can enter your
                    Order ID on our tracking system to see timestamps of exactly which stage your
                    fabric is undergoing.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-3xl font-extrabold text-foreground">
                Experience the SpinShine standard
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Clean curtains, stain-free carpets, and sanitized mattresses are just a click away.
                Book now for Bangalore's best home care service.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/book"
                  className="rounded-full bg-navy-gradient px-8 py-4 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Book Your Pickup
                </Link>
                <Link
                  to="/track"
                  className="rounded-full border border-border px-8 py-4 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-secondary"
                >
                  Track an Order
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
