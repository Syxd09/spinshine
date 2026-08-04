import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { ScrollProgress, useParallax, CountUp } from "@/components/site/motion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { useCatalog } from "@/lib/catalog-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpinShine — Professional Fabric Care, Delivered to Your Doorstep" },
      {
        name: "description",
        content:
          "Bangalore's premium curtain, carpet, sofa, mattress and blanket cleaning service. Pickup, on-site cleaning and doorstep delivery within 30 km.",
      },
      { property: "og:title", content: "SpinShine — Professional Fabric Care in Bangalore" },
      {
        property: "og:description",
        content:
          "Curtains, carpets, blankets, sofas and mattresses cleaned by professionals. Pickup, on-site service and doorstep delivery across Bangalore.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-teal selection:text-navy">
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Stats />
        <ServicesIntro />
        <ProcessTimeline />
        <OnSiteShowcase />
        <BeforeAfterSection />
        <PricingSection />
        <CoverageSection />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const { ref, y } = useParallax(0.2);
  const { texts, images } = useCatalog();
  return (
    <section ref={ref} className="relative flex min-h-[96vh] items-center overflow-hidden bg-navy">
      {/* Immersive Parallax Image */}
      <img
        src={images.hero}
        alt="SpinShine fabric care banner"
        width={1920}
        height={1088}
        className="absolute inset-0 h-[122%] w-full object-cover opacity-40 will-change-transform scale-[1.05]"
        style={{ transform: `translate3d(0, ${y}px, 0)` }}
      />
      {/* Sleek Overlay Gradient & Blueprint Grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/55" />
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-40" />

      {/* Background Slow-Spin Glow Blob */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-royal/10 rounded-full blur-3xl animate-slow-spin pointer-events-none" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-36 pb-24">
        <div className="grid gap-16 lg:grid-cols-[1.25fr_0.75fr] items-center">
          <div className="space-y-8">
            <Reveal delay={60}>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4.5 py-1.5 text-xs font-bold tracking-[0.25em] text-teal uppercase backdrop-blur-sm">
                Bangalore · Premium Fabric Care
              </span>
            </Reveal>

            <h1 className="text-5xl leading-[1.05] text-white sm:text-6.5xl lg:text-7.5xl font-black tracking-tight">
              <span className="block text-white/90">{texts.heroHeading}</span>
              <span className="block mt-2">
                {texts.heroSubheading}{" "}
                <span className="font-serif italic font-semibold text-teal-400">
                  {texts.heroItalic}
                </span>
              </span>
            </h1>

            <p className="reveal max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              {texts.heroDesc}
            </p>

            <div className="reveal flex flex-wrap gap-5 pt-4">
              <Link
                to="/book"
                className="relative inline-flex items-center justify-center overflow-hidden rounded-full p-0.5 font-bold group shadow-lift hover:shadow-glow transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-teal via-royal to-gold rounded-full" />
                <span className="relative block px-8 py-3.5 text-sm font-bold bg-white text-navy rounded-full transition-colors group-hover:bg-transparent group-hover:text-white">
                  Book Pickup Now
                </span>
              </Link>
              <Link
                to="/pricing"
                className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-white/50 hover:bg-white/5"
              >
                Instant Calculator
              </Link>
            </div>
          </div>

          {/* Floating Premium Card on Hero */}
          <div className="hidden lg:block reveal" style={{ animationDelay: "200ms" }}>
            <SpotlightCard
              glowColor="rgba(20, 184, 166, 0.12)"
              borderColor="rgba(255, 255, 255, 0.15)"
              className="bg-navy/85 border-white/10"
              innerClassName="bg-transparent p-8 space-y-6"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase">
                  Live Availability Check
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">
                Book your slot before they fill up.
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Our mobile cleaning teams are operating today across all zones. Schedule same-day or
                next-day fabric extraction easily.
              </p>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs text-white/60">
                <span>{texts.availabilityLabel}</span>
                <span className="font-bold text-teal">{texts.availabilityValue}</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const { texts } = useCatalog();
  const items = [...texts.trustList, ...texts.trustList];
  return (
    <section className="border-y border-border bg-card py-5 overflow-hidden">
      <div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee flex shrink-0 gap-12 pr-12">
          {items.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/80 whitespace-nowrap"
            >
              <span className="text-teal font-extrabold">•</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { settings } = useCatalog();
  const stats = [
    { n: 12000, s: "+", l: "Fabrics Restored" },
    { n: 4200, s: "+", l: "Fine Homes Served" },
    { n: 48, s: "h", l: "Average Turnaround" },
    { n: settings.radiusKm, s: " km", l: "Service Radius" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 border-b border-border bg-grid-pattern">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-8 before:w-1 before:bg-gradient-to-b before:from-royal before:to-teal before:rounded-full">
              <span className="font-display text-4xl font-extrabold text-foreground lg:text-5xl">
                <CountUp to={s.n} suffix={s.s} />
              </span>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.l}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <span className="text-xs font-bold tracking-[0.2em] text-royal bg-royal/5 px-3.5 py-1 rounded-full uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5.55xl font-black text-foreground leading-[1.1]">
        {title}
      </h2>
      {copy && (
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">{copy}</p>
      )}
    </div>
  );
}

function ServicesIntro() {
  const { services, images } = useCatalog();
  // Show first 3 active services
  const displayedServices = services.slice(0, 3);
  return (
    <section
      id="services"
      className="mx-auto max-w-6xl px-6 py-28 lg:py-36 bg-grid-pattern relative"
    >
      <div className="absolute top-10 right-10 w-96 h-96 bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <Reveal>
        <SectionHead
          eyebrow="Services"
          title="Exceptional fabric restoration. Tailored methods."
          copy="Each material is sorted, chemically tested, and cleaned according to its unique characteristics. We treat nothing as generic laundry."
        />
      </Reveal>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayedServices.map((s, i) => {
          const serviceImg = images[s.key as keyof typeof images] || images.curtains;
          return (
            <Reveal key={s.key} delay={i * 80}>
              <SpotlightCard className="flex h-full flex-col overflow-hidden group">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="absolute inset-0 bg-navy/20 z-10 transition-opacity group-hover/card:opacity-0" />
                  <img
                    src={serviceImg}
                    alt={s.name}
                    loading="lazy"
                    width={900}
                    height={1100}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-8 relative">
                  <h3 className="text-xl font-bold text-foreground transition-colors group-hover/card:text-royal">
                    {s.name}
                  </h3>
                  <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      from{" "}
                      <span className="text-royal font-display text-base font-black">
                        ₹{s.rate} / {s.unit}
                      </span>
                    </span>
                    <Link
                      to="/services"
                      className="text-xs font-bold text-royal tracking-wider uppercase transition-transform duration-300 group-hover/card:translate-x-1"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function ProcessTimeline() {
  const { texts } = useCatalog();
  return (
    <section className="bg-navy text-white py-28 lg:py-36 relative overflow-hidden">
      {/* Decorative Blur Background Blob */}
      <div className="absolute top-1/4 -left-48 w-[400px] h-[400px] bg-royal/15 rounded-full blur-3xl animate-float" />
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3.5 py-1 text-xs font-bold tracking-[0.2em] text-teal uppercase">
              How it works
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Four steps. Absolute{" "}
              <span className="font-serif italic font-semibold text-teal-400">peace of mind.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              From reservation to final rehanging, our operational process is transparent, barcoded,
              and time-stamped for complete quality control.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-lift">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 bg-navy">
            {texts.steps.map((step, i) => (
              <div
                key={i}
                className="h-full p-8 hover:bg-white/5 transition-colors duration-300 relative group/step border-r border-b border-white/10 last:border-0 md:[&:nth-child(even)]:border-r-0 lg:[&:nth-child(even)]:border-r"
              >
                <span className="font-display text-4xl font-extrabold text-teal/20 transition-colors duration-500 group-hover/step:text-teal/40">
                  {step.n}
                </span>
                <h3 className="mt-6 text-lg font-bold text-white group-hover/step:text-teal transition-colors">
                  {step.t}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-white/50">{step.c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OnSiteShowcase() {
  const { images } = useCatalog();
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 lg:py-36 bg-grid-pattern relative">
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-6">
            <SectionHead
              eyebrow="On-site cleaning"
              title="Professional cleaning. Done inside your home."
              copy="No transport required. Our technicians arrive with specialized mobile extraction gear to restore your heavy furniture on-site, leaving it sanitized and dry in hours."
            />

            <ul className="grid gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:grid-cols-2">
              {["Sofas & Recliners", "Mattresses", "Wall-to-wall Carpets", "Office Seating"].map(
                (x, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    <span>{x}</span>
                  </li>
                ),
              )}
            </ul>

            <div className="pt-4">
              <span className="inline-block text-[10px] font-bold tracking-wider text-navy px-4.5 py-2 bg-secondary rounded-full uppercase">
                * Entire Bangalore covered — no radius limit for on-site services.
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="surface overflow-hidden shadow-soft rounded-3xl group relative">
            <div className="absolute inset-0 bg-navy/10 z-10 pointer-events-none group-hover:opacity-0 transition-opacity" />
            <img
              src={images.sofa}
              alt="Technician performing sofa cleaning on-site"
              loading="lazy"
              width={900}
              height={1100}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  const { images } = useCatalog();
  return (
    <section className="border-y border-border bg-card py-28 lg:py-36 bg-grid-pattern">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <SectionHead
            align="center"
            eyebrow="Results"
            title="Slide to see the difference."
            copy="Real cleaning jobs, untreated. Deep extraction pulls out dirt and grime standard vacuum cleaners cannot reach."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-16 rounded-3xl overflow-hidden shadow-lift border border-border">
            <BeforeAfter before={images.baBefore} after={images.baAfter} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PricingSection() {
  const { services } = useCatalog();
  // Show first 3 active services
  const displayedServices = services.slice(0, 3);
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 lg:py-36 border-b border-border bg-grid-pattern relative">
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <Reveal>
        <SectionHead
          align="center"
          eyebrow="Pricing"
          title="Simple, transparent price lists."
          copy="Pricing is always calculated per unit with zero surprise fees or hidden delivery surcharges."
        />
      </Reveal>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {displayedServices.map((s, i) => (
          <Reveal key={s.key} delay={(i + 1) * 60}>
            <SpotlightCard
              className="p-px"
              innerClassName="p-8 flex flex-col h-full justify-between space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground">{s.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-muted-foreground">from</span>
                  <span className="font-display text-4xl font-extrabold text-foreground">
                    ₹{s.rate}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {s.unit} onwards</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
              <Link
                to="/pricing"
                className="w-full text-center rounded-full bg-navy py-3.5 text-xs font-bold tracking-wider uppercase text-white transition-all hover:bg-royal hover:shadow-glow"
              >
                Check details
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CoverageSection() {
  const { localities, settings } = useCatalog();
  const displayedAreas = localities.slice(0, 10).map((l) => l.name);
  return (
    <section className="bg-card py-28 lg:py-36 bg-grid-pattern relative">
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-6">
            <SectionHead
              eyebrow="Service area"
              title="Full pickup service within 30 km."
              copy={`We pick up and return anywhere within ${settings.radiusKm} km of our central Bangalore care hub. On-site cleaning services are available across the entire city metropolitan boundary.`}
            />

            <div className="flex flex-wrap gap-2.5 pt-4">
              {displayedAreas.map((a, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-border bg-background px-4.5 py-2 text-xs font-semibold text-muted-foreground/80 hover:border-royal/30 hover:text-royal transition-all duration-300"
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to="/coverage"
                className="inline-flex items-center gap-2 text-xs font-bold text-royal uppercase tracking-wider group"
              >
                <span>Check Your Locality</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-navy-gradient shadow-lift border border-border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.546_0.215_262.881/0.3),transparent_62%)]" />
            <div className="absolute top-1/2 left-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/30 bg-teal/5 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/50 bg-teal/10" />
            <div className="absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_0_10px_oklch(0.704_0.14_182.503/0.3)]" />

            <span className="absolute bottom-6 left-6 text-xs font-bold tracking-[0.2em] text-white/50 uppercase">
              {settings.radiusKm} km pickup radius · Bengaluru
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
