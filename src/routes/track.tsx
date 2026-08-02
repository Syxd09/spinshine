import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TRACK_STAGES, STAGE_LABELS } from "@/lib/booking";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — SpinShine" },
      {
        name: "description",
        content:
          "Follow your SpinShine order live: collected, cleaning, drying, quality check, out for delivery and delivered.",
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
    const { data } = await supabase.rpc("track_booking", {
      _order_ref: ref.trim(),
      _phone: phone.trim(),
    });
    setLoading(false);
    const row = (data as Booking[] | null)?.[0];
    if (!row) {
      setError("No order matches that ID and phone number.");
      return;
    }
    setResult(row);
  }

  const activeIndex = result ? TRACK_STAGES.indexOf(result.status as (typeof TRACK_STAGES)[number]) : -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to="/" className="font-display text-lg font-extrabold">
            Spin<span className="text-teal">Shine</span>
          </Link>
          <Link to="/book" className="text-sm font-semibold text-royal">
            Book a pickup
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <h1 className="text-3xl sm:text-4xl">Track your order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter the order ID from your confirmation and the phone number you booked with.
        </p>

        <div className="surface mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Order ID (SS-…)"
            maxLength={20}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            maxLength={15}
            className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={lookup}
            disabled={loading || !ref || !phone}
            className="rounded-full bg-navy-gradient px-7 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40"
          >
            {loading ? "Checking…" : "Track"}
          </button>
        </div>

        {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

        {result && (
          <div className="reveal mt-10">
            <div className="surface p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-extrabold">{result.order_ref}</h2>
                <span className="rounded-full bg-teal/15 px-4 py-1 text-xs font-semibold text-foreground">
                  {STAGE_LABELS[result.status] ?? result.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {result.service} ·{" "}
                {result.mode === "pickup" ? "Pickup & delivery" : "On-site cleaning"} · ₹
                {result.estimated_price}
              </p>

              <ol className="mt-9 space-y-0">
                {TRACK_STAGES.map((s, i) => {
                  const done = i <= activeIndex;
                  return (
                    <li key={s} className="relative flex gap-5 pb-8 last:pb-0">
                      {i < TRACK_STAGES.length - 1 && (
                        <span
                          className={`absolute top-4 left-[7px] h-full w-px ${done ? "bg-teal" : "bg-border"}`}
                        />
                      )}
                      <span
                        className={`relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full transition-colors duration-500 ${
                          done
                            ? "bg-teal shadow-[0_0_0_5px_oklch(0.704_0.14_182.503/0.18)]"
                            : "bg-border"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {STAGE_LABELS[s]}
                        </p>
                        {i === activeIndex && (
                          <p className="mt-1 text-xs text-muted-foreground">In progress now</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 grid gap-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Pickup</span>
                  <p className="font-medium">
                    {new Date(result.pickup_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {result.pickup_slot}
                  </p>
                </div>
                {result.delivery_date && (
                  <div>
                    <span className="text-muted-foreground">Expected delivery</span>
                    <p className="font-medium">
                      {new Date(result.delivery_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {result.delivery_slot}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
