import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  SERVICES,
  LOCALITIES,
  RADIUS_KM,
  PAYMENT_METHODS,
  estimatePrice,
  makeOrderRef,
  nextDays,
  toISODate,
  type ServiceKey,
} from "@/lib/booking";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Pickup — SpinShine Bangalore" },
      {
        name: "description",
        content:
          "Schedule curtain, carpet, sofa or mattress cleaning in Bangalore. Pick your date and 2-hour time slot, see live availability and confirm in under a minute.",
      },
      { property: "og:title", content: "Book a Pickup — SpinShine" },
      {
        property: "og:description",
        content:
          "Choose your service, slot and address. Live slot availability, 30 km pickup radius check and instant confirmation.",
      },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

const STEPS = ["Service", "Mode", "Address", "Schedule", "Details", "Review"];

type Slot = { slot: string; remaining: number };

function BookPage() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceKey | null>(null);
  const [qty, setQty] = useState(2);
  const [mode, setMode] = useState<"pickup" | "onsite">("pickup");
  const [locality, setLocality] = useState<string>("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("upi");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const km = LOCALITIES.find((l) => l.name === locality)?.km ?? null;
  const inRadius = km !== null && km <= RADIUS_KM;
  const price = service ? estimatePrice(service, qty, mode) : 0;
  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    supabase
      .from("blocked_dates")
      .select("blocked_on")
      .then(({ data }) => setBlocked((data ?? []).map((d) => d.blocked_on)));
  }, []);

  useEffect(() => {
    if (!date) return;
    setSlots(null);
    setSlot("");
    supabase
      .rpc("slot_availability", { _date: date, _mode: mode })
      .then(({ data }) => setSlots((data as Slot[]) ?? []));
  }, [date, mode]);

  useEffect(() => {
    if (mode === "onsite" && km !== null && km > RADIUS_KM) return;
    if (mode === "pickup" && km !== null && km > RADIUS_KM) setMode("onsite");
  }, [km, mode]);

  const canContinue = [
    !!service && qty > 0,
    !!mode,
    !!locality && address.trim().length > 5 && (inRadius || mode === "onsite"),
    !!date && !!slot,
    name.trim().length > 1 && /^[0-9]{10}$/.test(phone.replace(/\D/g, "").slice(-10)),
    true,
  ][step];

  async function confirm() {
    if (!service || !date || !slot) return;
    setSubmitting(true);
    setError(null);
    const ref = makeOrderRef();
    const delivery = new Date(date);
    delivery.setDate(delivery.getDate() + (mode === "pickup" ? 3 : 0));
    const { error: err } = await supabase.from("bookings").insert({
      order_ref: ref,
      service: SERVICES.find((s) => s.key === service)!.name,
      mode,
      customer_name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      address: `${address.trim()}, ${locality}`,
      landmark: landmark.trim() || null,
      notes: notes.trim() || null,
      pickup_date: date,
      pickup_slot: slot,
      delivery_date: toISODate(delivery),
      delivery_slot: slot,
      estimated_price: price,
      payment_method: payment,
      status: "confirmed",
    });
    setSubmitting(false);
    if (err) {
      setError("We couldn't confirm that slot. Please pick another and try again.");
      return;
    }
    setOrderRef(ref);
  }

  if (orderRef) return <Success orderRef={orderRef} date={date} slot={slot} price={price} />;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 pt-28 pb-24">
        <h1 className="text-3xl sm:text-4xl">Book your pickup</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Live slot availability · free rescheduling up to 12 hours before
        </p>

        <Stepper step={step} />

        <div key={step} className="reveal mt-10">
          {step === 0 && (
            <Grid>
              {SERVICES.map((s) => (
                <Choice
                  key={s.key}
                  active={service === s.key}
                  onClick={() => setService(s.key)}
                  title={s.name}
                  sub={`${s.desc} · ₹${s.rate} / ${s.unit}`}
                />
              ))}
              {service && (
                <div className="surface col-span-full flex items-center justify-between p-6">
                  <div>
                    <p className="font-semibold">How many items?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Charged per {SERVICES.find((s) => s.key === service)!.unit}. Final count
                      verified at pickup.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Round onClick={() => setQty((q) => Math.max(1, q - 1))}>−</Round>
                    <span className="w-8 text-center font-display text-2xl font-bold">{qty}</span>
                    <Round onClick={() => setQty((q) => Math.min(50, q + 1))}>+</Round>
                  </div>
                </div>
              )}
            </Grid>
          )}

          {step === 1 && (
            <Grid>
              <Choice
                active={mode === "pickup"}
                onClick={() => setMode("pickup")}
                title="Pickup & delivery"
                sub="We collect, clean at our facility and return in 48–72 hours. Within 30 km."
              />
              <Choice
                active={mode === "onsite"}
                onClick={() => setMode("onsite")}
                title="On-site cleaning"
                sub="Our mobile unit cleans at your home in 2–4 hours. Anywhere in Bangalore."
              />
            </Grid>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Locality">
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select your area</option>
                  {LOCALITIES.map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name} · {l.km} km
                    </option>
                  ))}
                </select>
              </Field>
              {km !== null && (
                <div
                  className={`rounded-2xl border p-5 text-sm ${
                    inRadius
                      ? "border-teal/40 bg-teal/10 text-foreground"
                      : "border-border bg-secondary text-foreground"
                  }`}
                >
                  {inRadius ? (
                    <>
                      <strong>{km} km from our hub — inside the pickup radius.</strong> Pickup,
                      cleaning and doorstep delivery all available.
                    </>
                  ) : (
                    <>
                      <strong>{km} km — outside the 30 km pickup radius.</strong> Pickup is
                      unavailable here, but on-site cleaning is still covered. We've switched your
                      booking to on-site.
                    </>
                  )}
                </div>
              )}
              <Field label="Full address">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  maxLength={300}
                  placeholder="Flat / house no, building, street"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
              <Field label="Landmark (optional)">
                <input
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold">Choose a date</p>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {days.map((d) => {
                    const iso = toISODate(d);
                    const off = blocked.includes(iso);
                    const on = date === iso;
                    return (
                      <button
                        key={iso}
                        disabled={off}
                        onClick={() => setDate(iso)}
                        className={`min-w-[74px] shrink-0 rounded-2xl border px-3 py-4 text-center transition-all duration-300 ${
                          on
                            ? "border-transparent bg-navy-gradient text-white shadow-lift"
                            : off
                              ? "cursor-not-allowed border-border bg-secondary opacity-40"
                              : "border-border bg-card hover:-translate-y-1 hover:shadow-soft"
                        }`}
                      >
                        <span className="block text-[11px] tracking-wide uppercase opacity-70">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <span className="mt-1 block font-display text-xl font-bold">
                          {d.getDate()}
                        </span>
                        <span className="block text-[11px] opacity-70">
                          {d.toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {date && (
                <div className="reveal">
                  <p className="text-sm font-semibold">Choose a 2-hour slot</p>
                  {!slots && <p className="mt-4 text-sm text-muted-foreground">Checking live availability…</p>}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(slots ?? [])
                      .filter((s) => s.remaining > 0)
                      .map((s) => (
                        <button
                          key={s.slot}
                          onClick={() => setSlot(s.slot)}
                          className={`rounded-2xl border px-4 py-4 text-sm transition-all duration-300 ${
                            slot === s.slot
                              ? "border-transparent bg-navy-gradient text-white shadow-lift"
                              : "border-border bg-card hover:-translate-y-1 hover:shadow-soft"
                          }`}
                        >
                          <span className="block font-semibold">{s.slot}</span>
                          <span
                            className={`mt-1 block text-xs ${slot === s.slot ? "text-white/60" : "text-muted-foreground"}`}
                          >
                            {s.remaining} slot{s.remaining > 1 ? "s" : ""} left
                          </span>
                        </button>
                      ))}
                  </div>
                  {slots && slots.every((s) => s.remaining === 0) && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Fully booked — please choose another date.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={name} onChange={setName} maxLength={80} />
              </Field>
              <Field label="Phone">
                <Input value={phone} onChange={setPhone} maxLength={15} placeholder="10-digit mobile" />
              </Field>
              <Field label="Email (optional)">
                <Input value={email} onChange={setEmail} maxLength={120} />
              </Field>
              <Field label="Special instructions (optional)">
                <Input value={notes} onChange={setNotes} maxLength={300} />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="surface p-7">
                <h2 className="text-lg">Order summary</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <Row k="Service" v={`${SERVICES.find((s) => s.key === service)?.name} × ${qty}`} />
                  <Row k="Mode" v={mode === "pickup" ? "Pickup & delivery" : "On-site cleaning"} />
                  <Row
                    k="Date & slot"
                    v={`${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${slot}`}
                  />
                  <Row k="Address" v={`${address}, ${locality}`} />
                  <Row k="Contact" v={`${name} · ${phone}`} />
                  <Row
                    k={mode === "pickup" ? "Estimated delivery" : "Completion"}
                    v={mode === "pickup" ? "48–72 hours after pickup" : "Same day, 2–4 hours"}
                  />
                </dl>
                <div className="mt-6 flex items-baseline justify-between border-t border-border pt-5">
                  <span className="text-sm text-muted-foreground">Estimated total</span>
                  <span className="font-display text-3xl font-extrabold">₹{price}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Final amount confirmed after on-site inspection. No hidden charges.
                </p>
              </div>
              <div className="surface p-7">
                <h2 className="text-lg">Payment</h2>
                <div className="mt-5 space-y-3">
                  {PAYMENT_METHODS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPayment(p.key)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                        payment === p.key ? "border-royal bg-royal/5" : "border-border"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-muted-foreground">{p.hint}</span>
                    </button>
                  ))}
                </div>
                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
                <button
                  onClick={confirm}
                  disabled={submitting}
                  className="mt-6 w-full rounded-full bg-navy-gradient py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting ? "Confirming…" : "Confirm booking"}
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 5 && (
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm font-semibold text-muted-foreground disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="rounded-full bg-navy-gradient px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="font-display text-lg font-extrabold">
          Spin<span className="text-teal">Shine</span>
        </Link>
        <Link to="/track" className="text-sm font-semibold text-royal">
          Track an order
        </Link>
      </div>
    </header>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mt-10 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-accent)] transition-all duration-700"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
            <span
              className={`mt-2 hidden text-xs sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}
            >
              {s}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Choice({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-6 text-left transition-all duration-400 ${
        active
          ? "-translate-y-1 border-transparent bg-navy-gradient text-white shadow-lift"
          : "border-border bg-card hover:-translate-y-1 hover:shadow-soft"
      }`}
    >
      <span className="block font-display text-base font-bold">{title}</span>
      <span className={`mt-2 block text-sm ${active ? "text-white/65" : "text-muted-foreground"}`}>
        {sub}
      </span>
    </button>
  );
}

function Round({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-lg transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function Success({
  orderRef,
  date,
  slot,
  price,
}: {
  orderRef: string;
  date: string;
  slot: string;
  price: number;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-gradient px-6">
      <div className="reveal w-full max-w-md rounded-3xl bg-card p-10 text-center shadow-lift">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15">
          <span className="text-3xl text-teal">✓</span>
        </div>
        <h1 className="mt-6 text-2xl">Booking confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          · {slot}
        </p>
        <div className="mt-7 rounded-2xl bg-secondary p-5">
          <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Order ID</span>
          <p className="mt-1 font-display text-2xl font-extrabold">{orderRef}</p>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          Estimated total ₹{price}. We'll message you before arrival.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            to="/track"
            className="flex-1 rounded-full bg-navy-gradient py-3 text-sm font-semibold text-white"
          >
            Track order
          </Link>
          <Link
            to="/"
            className="flex-1 rounded-full border border-border py-3 text-sm font-semibold"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}
