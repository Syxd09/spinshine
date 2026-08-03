import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { cmsFaqs } from "@/lib/cms-config";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Find answers to common questions about curtain cleaning, carpet extraction, sofa washing, pricing, pickup, and delivery across Bangalore.",
      },
      { property: "og:title", content: "Frequently Asked Questions — SpinShine" },
      {
        property: "og:description",
        content: "Answers to your questions about professional fabric care, payments, and service radius in Bangalore.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
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
                Customer Support
              </span>
              <h1 className="mt-4 text-5xl sm:text-6.5xl lg:text-7.5xl font-black tracking-tight leading-none">
                Frequently Asked <span className="font-serif italic font-semibold text-teal-400">Questions.</span>
              </h1>
              <p className="mt-6 mx-auto max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed">
                Find clear answers to questions about fabric dry cleaning, on-site extraction, logistics, payments, and scheduling.
              </p>
            </Reveal>
          </div>
        </section>

        {/* FAQ Accordions Section */}
        <section className="mx-auto max-w-3xl px-6 py-28 bg-grid-pattern relative">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-royal/5 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="space-y-16 relative">
            {cmsFaqs.map((cat) => (
              <div key={cat.id} className="space-y-6">
                <Reveal>
                  <h2 className="text-lg font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    {cat.label}
                  </h2>
                </Reveal>
                
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {cat.questions.map((item, idx) => (
                    <Reveal key={idx} delay={idx * 30}>
                      <SpotlightCard className="shadow-soft hover:shadow-soft border-border/80" innerClassName="px-6 bg-card rounded-[24px]">
                        <AccordionItem
                          value={`${cat.id}-${idx}`}
                          className="border-0"
                        >
                          <AccordionTrigger className="text-sm font-bold text-foreground text-left py-4.5 hover:no-underline group">
                            <span className="group-hover:text-royal transition-colors">{item.q}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-5 border-t border-border pt-4">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      </SpotlightCard>
                    </Reveal>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        {/* Global Call to Action */}
        <section className="bg-card border-t border-border py-28 px-6 text-center relative overflow-hidden bg-grid-pattern">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-royal/5 rounded-full blur-3xl" />
          <div className="mx-auto max-w-2xl space-y-6 relative">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Still have questions?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                If your fabric care question isn't answered here, feel free to reach out to our fabric technicians directly on WhatsApp or by calling our customer care number.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <a
                  href="https://wa.me/910000000000"
                  className="rounded-full bg-navy-gradient px-8 py-4 text-xs font-bold tracking-wider uppercase text-white shadow-lift transition-transform hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Ask on WhatsApp
                </a>
                <Link
                  to="/book"
                  className="rounded-full border border-border px-8 py-4 text-xs font-bold tracking-wider uppercase text-foreground transition-colors hover:bg-secondary"
                >
                  Book Pickup
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
