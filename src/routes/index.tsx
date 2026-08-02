import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ScrollProgress, useParallax, CountUp } from "@/components/site/motion";

import { BeforeAfter } from "@/components/site/BeforeAfter";
import hero from "@/assets/hero.jpg";
import curtains from "@/assets/service-curtains.jpg";
import carpet from "@/assets/service-carpet.jpg";
import sofa from "@/assets/service-sofa.jpg";
import baBefore from "@/assets/ba-before.jpg";
import baAfter from "@/assets/ba-after.jpg";

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

const trust = [
  "Pickup & Delivery",
  "Same Day Slots",
  "Professional Team",
  "Eco Friendly Cleaning",
  "Transparent Pricing",
  "30 km Delivery Radius",
  "On-site Cleaning Across Bangalore",
];

const services = [
  {
    name: "Curtain Cleaning",
    slug: "curtain-cleaning",
    img: curtains,
    copy: "Removal, fabric-matched cleaning, pressing and rehanging — sheers to blackout drapes.",
    from: "₹99 / panel",
  },
  {
    name: "Carpet Cleaning",
    slug: "carpet-cleaning",
    img: carpet,
    copy: "Hot-water extraction that lifts embedded grit, allergens and stains from deep pile.",
    from: "₹25 / sq.ft",
  },
  {
    name: "Sofa Cleaning",
    slug: "sofa-cleaning",
    img: sofa,
    copy: "On-site upholstery shampoo and extraction with rapid-dry finishing.",
    from: "₹499 / seat",
  },
  {
    name: "Mattress Cleaning",
    slug: "mattress-cleaning",
    img: sofa,
    copy: "UV and steam sanitisation that removes dust mites and body soil.",
    from: "₹899",
  },
  {
    name: "Blanket Cleaning",
    slug: "blanket-cleaning",
    img: curtains,
    copy: "Gentle bulk-wash, dry and fold for quilts, duvets and woollen blankets.",
    from: "₹399",
  },
  {
    name: "Upholstery Cleaning",
    slug: "upholstery-cleaning",
    img: carpet,
    copy: "Dining chairs, recliners, ottomans and office seating restored on site.",
    from: "₹249 / unit",
  },
];

const steps = [
  ["01", "Book in 60 seconds", "Choose your service, pickup or on-site, and a slot that suits you."],
  ["02", "We collect", "A uniformed technician arrives, inspects and tags every item with you."],
  ["03", "Professional care", "Fabric-specific cleaning, drying and a two-stage quality check."],
  ["04", "Delivered back", "Pressed, wrapped and rehung at your door — tracked end to end."],
];

const areas = [
  "Whitefield",
  "HSR Layout",
  "Koramangala",
  "Indiranagar",
  "Yelahanka",
  "Hebbal",
  "JP Nagar",
  "RR Nagar",
  "Jayanagar",
  "Sarjapur Road",
  "Marathahalli",
  "Electronic City",
];

const faqs = [
  [
    "Do you remove and rehang curtains?",
    "Yes. Our technicians unhook, transport, clean and rehang every panel — hooks, rings and pelmets included, at no extra cost.",
  ],
  [
    "Can silk and delicate fabrics be cleaned?",
    "Silk, velvet, linen and embroidered fabrics are handled with a solvent-based delicate process. We test colour-fastness on a hidden section first.",
  ],
  [
    "How long does a typical order take?",
    "Curtains and blankets are returned in 48–72 hours. On-site sofa, mattress and carpet cleaning is completed the same day, in 2–4 hours.",
  ],
  [
    "What areas do you cover?",
    "Pickup and delivery run within a 30 km radius of central Bangalore. On-site cleaning is available across the entire city, including outer localities.",
  ],
  [
    "Is the cleaning safe for children and pets?",
    "We use biodegradable, low-residue solutions certified for indoor use, followed by a clean-water rinse and forced-air drying.",
  ],
  [
    "How is pricing calculated?",
    "By item, size and fabric — quoted upfront before we collect. No hidden charges, no surprise additions after cleaning.",
  ],
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Stats />
        <Services />
        <Process />
        <OnSite />
        <BeforeAfterSection />
        <Pricing />
        <Coverage />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        solid
          ? "h-16 border-white/10 bg-navy-gradient/95 backdrop-blur"
          : "h-20 border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-white">
          Spin<span className="text-teal">Shine</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          {[
            ["#services", "Services"],
            ["#process", "Process"],
            ["#pricing", "Pricing"],
            ["#coverage", "Coverage"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="link-underline transition-colors hover:text-white">
              {label}
            </a>
          ))}
          <Link to="/track" className="link-underline transition-colors hover:text-white">
            Track order
          </Link>
        </nav>
        <Link
          to="/book"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-navy transition-transform duration-300 hover:-translate-y-0.5"
        >
          Book Pickup
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  const { ref, y } = useParallax(0.25);
  return (
    <section ref={ref} className="relative flex min-h-[92vh] items-end overflow-hidden">
      <img
        src={hero}
        alt="SpinShine technician steam-cleaning curtains in a modern Bangalore home"
        width={1920}
        height={1088}
        className="absolute inset-0 h-[118%] w-full object-cover will-change-transform"
        style={{ transform: `translate3d(0, ${y}px, 0) scale(1.04)` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.16_0.04_265/0.95)_0%,oklch(0.16_0.04_265/0.55)_45%,oklch(0.16_0.04_265/0.35)_100%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-20">
        <div className="max-w-3xl">
          <span
            className="reveal inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-white/80 uppercase backdrop-blur"
            style={{ animationDelay: "60ms" }}
          >
            Bangalore · Fabric Care Specialists
          </span>
          <h1 className="mt-7 text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {["Professional Fabric Care", "for Modern Homes."].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className="reveal block"
                  style={{ animationDelay: `${180 + i * 140}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p
            className="reveal mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg"
            style={{ animationDelay: "520ms" }}
          >
            Curtains, carpets, blankets, sofas and mattresses cleaned by professionals — with
            pickup, on-site service and doorstep delivery across Bangalore.
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-3" style={{ animationDelay: "640ms" }}>
            <Link
              to="/book"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-lift transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book Pickup
            </Link>
            <a
              href="#pricing"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/10"
            >
              Get Instant Quote
            </a>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <span className="h-10 w-6 rounded-full border border-white/25 p-1">
          <span className="scroll-dot block h-1.5 w-1.5 rounded-full bg-white/70" />
        </span>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { n: 12000, s: "+", l: "Items cleaned" },
    { n: 4200, s: "+", l: "Homes served" },
    { n: 48, s: "h", l: "Average turnaround" },
    { n: 30, s: " km", l: "Pickup radius" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 90}>
            <div>
              <span className="font-display text-4xl font-extrabold text-foreground lg:text-5xl">
                <CountUp to={s.n} suffix={s.s} />
              </span>
              <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}


function TrustStrip() {
  const items = [...trust, ...trust];
  return (
    <section className="border-y border-border bg-card py-5">
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="marquee flex shrink-0 gap-10 pr-10">
          {items.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground"
            >
              <span className="text-teal">✓</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  light,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <span
        className={`text-xs font-semibold tracking-[0.2em] uppercase ${light ? "text-teal" : "text-royal"}`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-3xl sm:text-4xl lg:text-5xl ${light ? "text-white" : "text-foreground"}`}
      >
        {title}
      </h2>
      {copy && (
        <p
          className={`mt-5 text-base leading-relaxed ${light ? "text-white/65" : "text-muted-foreground"}`}
        >
          {copy}
        </p>
      )}
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <Reveal>
        <SectionHead
          eyebrow="Services"
          title="Every fabric in your home, cared for properly."
          copy="Each material gets its own process, its own solution and its own drying method. Nothing is treated as generic laundry."
        />
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.slug} delay={i * 70}>
            <article className="surface lift group flex h-full flex-col overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  width={900}
                  height={1100}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="text-xl">{s.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.copy}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="text-sm font-semibold text-foreground">from {s.from}</span>
                  <a
                    href="#book"
                    className="text-sm font-semibold text-royal transition-transform duration-300 group-hover:translate-x-1"
                  >
                    Learn more →
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="bg-navy-gradient py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <SectionHead
            light
            eyebrow="How it works"
            title="Four steps. Zero effort from you."
            copy="From the first tap to the moment your curtains are rehung, every stage is tracked and time-stamped."
          />
        </Reveal>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([n, title, copy], i) => (
            <Reveal key={n} delay={i * 90}>
              <div className="h-full bg-[oklch(0.19_0.045_265)] p-8">
                <span className="font-display text-4xl font-extrabold text-white/15">{n}</span>
                <h3 className="mt-6 text-lg text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OnSite() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <SectionHead
              eyebrow="On-site cleaning"
              title="Professional cleaning, performed at your home."
              copy="Some items shouldn't leave the house. Our mobile units bring commercial extraction equipment to your living room, bedroom or office floor — and leave it dry enough to use the same evening."
            />
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              {["Sofas & recliners", "Mattresses", "Wall-to-wall carpets", "Office carpets"].map(
                (x) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    {x}
                  </li>
                ),
              )}
            </ul>
            <p className="mt-8 text-sm font-semibold text-foreground">
              Entire Bangalore covered — no radius limit for on-site service.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="surface overflow-hidden">
            <img
              src={sofa}
              alt="Technician performing on-site sofa cleaning"
              loading="lazy"
              width={900}
              height={1100}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="border-y border-border bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <SectionHead
            eyebrow="Results"
            title="Drag to see the difference."
            copy="Real jobs, unretouched. Deep extraction removes what vacuuming leaves behind."
          />
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-12">
            <BeforeAfter before={baBefore} after={baAfter} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const tiers = [
  {
    name: "Curtains & Blankets",
    price: "₹99",
    unit: "per panel onwards",
    lines: ["Free removal & rehanging", "Fabric-matched process", "Pressed and wrapped", "48–72 hr turnaround"],
  },
  {
    name: "Carpets & Rugs",
    price: "₹25",
    unit: "per sq.ft onwards",
    lines: ["Hot-water extraction", "Stain & odour treatment", "Anti-allergen rinse", "Pickup or on-site"],
    featured: true,
  },
  {
    name: "Sofas & Mattresses",
    price: "₹499",
    unit: "per seat onwards",
    lines: ["On-site service", "Rapid-dry finishing", "UV sanitisation", "Same-day slots"],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
      <Reveal>
        <SectionHead
          eyebrow="Pricing"
          title="Transparent from the first message."
          copy="Quoted before we collect. No hidden charges, no post-cleaning additions."
        />
      </Reveal>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <div
              className={`lift flex h-full flex-col rounded-3xl p-8 ${
                t.featured
                  ? "bg-navy-gradient text-white shadow-lift"
                  : "surface"
              }`}
            >
              <h3 className={`text-lg ${t.featured ? "text-white" : "text-foreground"}`}>
                {t.name}
              </h3>
              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className={`font-display text-4xl font-extrabold ${t.featured ? "text-white" : "text-foreground"}`}
                >
                  {t.price}
                </span>
                <span
                  className={`text-xs ${t.featured ? "text-white/60" : "text-muted-foreground"}`}
                >
                  {t.unit}
                </span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {t.lines.map((l) => (
                  <li
                    key={l}
                    className={`flex items-start gap-3 ${t.featured ? "text-white/70" : "text-muted-foreground"}`}
                  >
                    <span className="text-teal">✓</span>
                    {l}
                  </li>
                ))}
              </ul>
              <a
                href="#book"
                className={`mt-8 rounded-full py-3 text-center text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 ${
                  t.featured ? "bg-white text-navy" : "bg-navy-gradient text-white"
                }`}
              >
                Get instant quote
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Coverage() {
  return (
    <section id="coverage" className="border-t border-border bg-card py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <Reveal>
          <div>
            <SectionHead
              eyebrow="Service area"
              title="Pickup within 30 km. On-site across all of Bangalore."
              copy="If you're inside the pickup radius we collect and deliver to your door. Outside it, our on-site team still comes to you."
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {areas.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-navy-gradient shadow-soft">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.546_0.215_262.881/0.35),transparent_62%)]" />
            <div className="absolute top-1/2 left-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/50 bg-teal/10" />
            <div className="absolute top-1/2 left-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/70 bg-teal/15" />
            <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_0_8px_oklch(0.704_0.14_182.503/0.25)]" />
            <span className="absolute bottom-6 left-6 text-xs tracking-[0.2em] text-white/70 uppercase">
              30 km pickup radius · Bengaluru
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24 lg:py-32">
      <Reveal>
        <SectionHead eyebrow="FAQ" title="Answers before you ask." />
      </Reveal>
      <div className="mt-12 divide-y divide-border border-y border-border">
        {faqs.map(([q, a], i) => (
          <Reveal key={q} delay={i * 50}>
            <details className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold text-foreground">
                {q}
                <span className="text-royal transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="book" className="bg-navy-gradient">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-display text-2xl font-extrabold text-white">
              Spin<span className="text-teal">Shine</span>
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Professional fabric care, delivered to your doorstep. Serving homes and offices across
              Bengaluru.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:+910000000000"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy"
              >
                Call now
              </a>
              <a
                href="https://wa.me/910000000000"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm tracking-[0.18em] text-white/50 uppercase">Services</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {services.map((s) => (
                <li key={s.slug}>{s.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm tracking-[0.18em] text-white/50 uppercase">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>Mon–Sun · 8:00 AM – 8:00 PM</li>
              <li>hello@spinshine.in</li>
              <li>Bengaluru, Karnataka</li>
              <li>Emergency cleaning available</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} SpinShine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
