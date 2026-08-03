import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACK_STAGES, STAGE_LABELS } from "@/lib/booking";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { SpotlightCard } from "@/components/site/SpotlightCard";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Follow your SpinShine order live: confirmed, collected, cleaning, drying, quality check, out for delivery and delivered.",
      },
      { property: "og:title", content: "Track Your Order — SpinShine" },
      {
        property: "og:description",
        content: "Enter your order ID and phone number to see live progress on your cleaning order.",
      },
      { property: "og:url", content: "/track" },
    ],
    links: [{ rel: "canonical", href: "/track" }],
  }),
  component: TrackPage,
});

type Booking = {
  order_ref: string;
  service: string;
  mode: string;
  pickup_date: string;
  pickup_slot: string;
  delivery_date: string | null;
  delivery_slot: string | null;
  status: string;
  estimated_price: number;
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  confirmed: "Your booking request has been registered in our system. A technician has been allocated to collect your fabrics.",
  collected: "Our operations team has collected your items. They are currently being cataloged and inspected at our central care facility.",
  cleaning: "Your fabrics are in the treatment chambers. We are applying fabric-specific eco-friendly extraction shampoos and sanitization cycles.",
  drying: "Your fabrics are in our climate-controlled dehumidification rooms to dry gently without compromising fiber integrity.",
  quality_check: "Our master inspection technicians are performing stain reviews, fiber strength checks, and UV-C sanitization passes.",
  out_for_delivery: "Your clean fabrics have been wrapped in breathable protective covers and are in transit back to your address.",
  delivered: "Fabric care complete. Your items have been successfully returned, rehung, or laid out. Thank you for choosing SpinShine!",
  cancelled: "This booking was cancelled. If this is a mistake, please contact customer care on WhatsApp.",
};

function TrackPage() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup() {
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Normalize input phone to numbers only
    const cleanInputPhone = phone.replace(/\D/g, "");
    const cleanInputRef = ref.trim().toUpperCase();

    try {
      // 1. Try Supabase
      const { data } = await supabase.rpc("track_booking", {
        _order_ref: cleanInputRef,
        _phone: phone.trim(),
      });
      
      const row = (data as Booking[] | null)?.[0];
      if (row) {
        setResult(row);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Supabase lookup failed, falling back to local storage", e);
    }

    // 2. Local storage fallback
    try {
      const localB = localStorage.getItem("ss_local_bookings");
      if (localB) {
        const list = JSON.parse(localB) as any[];
        const match = list.find((b) => {
          const matchRef = b.order_ref?.trim().toUpperCase() === cleanInputRef;
          const cleanBPhone = b.phone?.replace(/\D/g, "");
          const matchPhone = cleanBPhone === cleanInputPhone || b.phone?.trim() === phone.trim();
          return matchRef && matchPhone;
        });

        if (match) {
          setResult({
            order_ref: match.order_ref,
            service: match.service,
            mode: match.mode,
            pickup_date: match.pickup_date,
            pickup_slot: match.pickup_slot,
            delivery_date: match.delivery_date,
            delivery_slot: match.delivery_slot,
            status: match.status,
            estimated_price: match.estimated_price,
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }

    setLoading(false);
    setError("No order matches that ID and phone number.");
  }

  const activeIndex = result ? TRACK_STAGES.indexOf(result.status as (typeof TRACK_STAGES)[number]) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24 bg-grid-pattern relative">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-royal/5 rounded-full blur-3xl pointer-events-none" />
        
        <Reveal>
          <span className="text-xs font-bold tracking-[0.2em] text-royal bg-royal/5 px-3.5 py-1 rounded-full uppercase">
            Order Status
          </span>
          <h1 className="text-4xl sm:text-5.5xl font-black mt-4 text-foreground leading-[1.1]">Track your order</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-md">
            Enter the order reference ID from your confirmation receipt and the registered phone number to follow treatment progress.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="surface mt-10 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] border border-border shadow-soft rounded-3xl">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Order ID (SS-…)"
              maxLength={30}
              className="rounded-xl border border-border bg-background px-4.5 py-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              maxLength={20}
              className="rounded-xl border border-border bg-background px-4.5 py-3.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={lookup}
              disabled={loading || !ref || !phone}
              className="rounded-full bg-navy text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lift hover:bg-royal hover:shadow-glow transition-all duration-300 disabled:opacity-40"
            >
              {loading ? "Checking…" : "Track"}
            </button>
          </div>
        </Reveal>

        {error && (
          <Reveal>
            <p className="mt-6 text-xs font-bold text-royal bg-royal/5 border border-royal/10 p-4 rounded-xl text-center">
              ⚠️ {error}
            </p>
          </Reveal>
        )}

        {result && (
          <Reveal delay={120}>
            <div className="mt-12 space-y-6">
              <SpotlightCard className="p-px" innerClassName="p-8 space-y-8 bg-card rounded-[24px]">
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <span className="text-[10px] font-extrabold bg-secondary text-foreground px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Reference Number
                    </span>
                    <h2 className="font-display text-2xl font-black text-foreground mt-2">{result.order_ref}</h2>
                  </div>
                  <span className="rounded-full bg-teal/10 px-4.5 py-2 text-xs font-bold text-teal uppercase tracking-wider border border-teal/20">
                    {STAGE_LABELS[result.status] ?? result.status}
                  </span>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-semibold">Service Profile:</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">{result.service}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Care Method:</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">
                      {result.mode === "pickup" ? "Premium Pickup & Return" : "Specialist On-site Extraction"}
                    </p>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-[10px] font-extrabold text-foreground uppercase tracking-widest">
                    Live Progress History:
                  </h3>
                  <ol className="relative border-l border-border ml-2 pl-6 space-y-8">
                    {TRACK_STAGES.map((s, i) => {
                      const done = i <= activeIndex;
                      const current = i === activeIndex;
                      return (
                        <li key={s} className="relative">
                          {/* Circle marker */}
                          <span
                            className={`absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                              current
                                ? "bg-teal ring-4 ring-teal/20 scale-125"
                                : done
                                ? "bg-teal/70"
                                : "bg-border"
                            }`}
                          />
                          <div className="space-y-1">
                            <p
                              className={`text-xs font-bold uppercase tracking-wider ${
                                done ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {STAGE_LABELS[s]}
                              {current && (
                                <span className="ml-2.5 bg-teal/10 border border-teal/20 text-teal px-2 py-0.5 rounded text-[8px] font-extrabold">
                                  Current Stage
                                </span>
                              )}
                            </p>
                            {done && (
                              <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                                {STAGE_DESCRIPTIONS[s]}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-8 grid gap-4 border-t border-border pt-6 text-xs sm:grid-cols-2">
                  <div className="p-4 rounded-xl border border-border bg-secondary/10">
                    <span className="text-muted-foreground font-semibold">Registered Pickup</span>
                    <p className="font-bold text-foreground text-sm mt-1">
                      {new Date(result.pickup_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {result.pickup_slot}
                    </p>
                  </div>
                  {result.delivery_date && (
                    <div className="p-4 rounded-xl border border-border bg-secondary/10">
                      <span className="text-muted-foreground font-semibold">Expected Return / Finish</span>
                      <p className="font-bold text-foreground text-sm mt-1">
                        {new Date(result.delivery_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {result.delivery_slot}
                      </p>
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </div>
          </Reveal>
        )}
      </main>

      <Footer />
    </div>
  );
}
