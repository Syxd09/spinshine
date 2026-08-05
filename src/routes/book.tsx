import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS, makeOrderRef, nextDays, toISODate } from "@/lib/booking";
import { useCatalog } from "@/lib/catalog-state";
import { X } from "lucide-react";

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

const HUB_COORDS: [number, number] = [12.9716, 77.5946];

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const LOCALITY_COORDS: Record<string, [number, number]> = {
  Koramangala: [12.9352, 77.6245],
  Indiranagar: [12.9719, 77.6412],
  "HSR Layout": [12.9141, 77.6413],
  Jayanagar: [12.9250, 77.5897],
  "JP Nagar": [12.9063, 77.5857],
  Whitefield: [12.9698, 77.7500],
  Marathahalli: [12.9569, 77.7011],
  Hebbal: [13.0358, 77.5970],
  Yelahanka: [13.1007, 77.5963],
  "RR Nagar": [12.9221, 77.5176],
  "Sarjapur Road": [12.9165, 77.6762],
  "Electronic City": [12.8452, 77.6602],
  Nelamangala: [13.0963, 77.3916],
  Devanahalli: [13.2499, 77.7099],
  Hoskote: [13.0711, 77.7983],
};

function BookPage() {
  const { services, localities, settings } = useCatalog();
  const [mapLat, setMapLat] = useState(12.9716);
  const [mapLng, setMapLng] = useState(77.5946);
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
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
  const [blocked, setBlocked] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

  // Simulated payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paySimulating, setPaySimulating] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const [maxStep, setMaxStep] = useState(0);

  useEffect(() => {
    setMaxStep((m) => Math.max(m, step));
  }, [step]);

  const pinpointDistance = getDistanceKm(mapLat, mapLng, HUB_COORDS[0], HUB_COORDS[1]);
  const km = parseFloat(pinpointDistance.toFixed(1));
  const inRadius = km <= settings.radiusKm;
  const svc = service ? services.find((s) => s.key === service) : undefined;
  const price = service
    ? (svc?.rate ?? 0) * Math.max(1, qty) + (mode === "onsite" ? settings.onsiteFee : 0)
    : 0;
  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    // Load from Supabase first, merge with local storage
    supabase
      .from("blocked_dates")
      .select("blocked_on, reason")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        for (const d of data ?? []) {
          map[d.blocked_on] = d.reason || "Unavailable";
        }
        // Also merge in locally-blocked dates from admin panel
        try {
          const localRaw = localStorage.getItem("ss_local_blocked_dates");
          if (localRaw) {
            for (const d of JSON.parse(localRaw)) {
              if (d.blocked_on && !map[d.blocked_on]) {
                map[d.blocked_on] = d.reason || "Blocked";
              }
            }
          }
        } catch {
          /* ignore malformed local data */
        }
        setBlocked(map);
      });
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
    if (mode === "onsite" && km !== null && km > settings.radiusKm) return;
    if (mode === "pickup" && km !== null && km > settings.radiusKm) setMode("onsite");
  }, [km, mode, settings.radiusKm]);

  useEffect(() => {
    if (locality && LOCALITY_COORDS[locality]) {
      const [lat, lng] = LOCALITY_COORDS[locality];
      setMapLat(lat);
      setMapLng(lng);
      setAddress((prev) => {
        const clean = prev.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "").trim();
        return clean ? `${clean} [GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}]` : `[GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}]`;
      });
    }
  }, [locality]);

  const canContinue = [
    !!service && qty > 0,
    !!mode,
    !!locality && address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "").trim().length > 5 && (inRadius || mode === "onsite"),
    !!date && !!slot,
    name.trim().length > 1 && /^[0-9]{10}$/.test(phone.replace(/\D/g, "").slice(-10)),
    true,
  ][step];

  async function executeBooking() {
    if (!service || !date || !slot) return false;
    setSubmitting(true);
    setError(null);
    const ref = makeOrderRef();
    const delivery = new Date(date);
    delivery.setDate(delivery.getDate() + (mode === "pickup" ? settings.deliveryDays : 0));
    const { data: sessionData } = await supabase.auth.getSession();
    const bookingPayload = {
      order_ref: ref,
      service: svc?.name ?? "",
      mode,
      customer_name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      address: `${address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "").trim()}, ${locality} [GPS: ${mapLat.toFixed(6)}, ${mapLng.toFixed(6)}]`,
      landmark: landmark.trim() || null,
      notes: notes.trim() || null,
      pickup_date: date,
      pickup_slot: slot,
      delivery_date: toISODate(delivery),
      delivery_slot: slot,
      estimated_price: price,
      payment_method: payment,
      status: "confirmed",
      qty: Math.max(1, qty),
      line_items: [
        {
          service: svc?.key ?? service,
          name: svc?.name ?? "",
          unit: svc?.unit ?? "",
          qty: Math.max(1, qty),
          rate: svc?.rate ?? 0,
          price: (svc?.rate ?? 0) * Math.max(1, qty),
        },
      ],
      customer_id: sessionData?.session?.user.id ?? null,
    };

    const { error: err } = await supabase.from("bookings").insert(bookingPayload);
    setSubmitting(false);
    if (err) {
      setError("We couldn't confirm that slot. Please pick another and try again.");
      return false;
    }

    // Mirror to local storage
    try {
      const localB = localStorage.getItem("ss_local_bookings");
      const list = localB ? JSON.parse(localB) : [];
      list.unshift({
        id: Math.random().toString(36).substring(2, 9),
        ...bookingPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem("ss_local_bookings", JSON.stringify(list));
    } catch (e) {
      console.error("Local storage mirror save failed", e);
    }
    setOrderRef(ref);
    return true;
  }

  async function confirm() {
    if (payment === "cash") {
      await executeBooking();
    } else {
      setShowPaymentModal(true);
    }
  }

  if (orderRef) return <Success orderRef={orderRef} date={date} slot={slot} price={price} phone={phone} />;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 pt-28 pb-24">
        <h1 className="text-3xl sm:text-4xl">Book your pickup</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Live slot availability · free rescheduling up to 12 hours before
        </p>

        <Stepper step={step} setStep={setStep} maxStep={maxStep} />

        <div key={step} className="reveal mt-10">
          {step === 0 && (
            <Grid>
              {services.map((s) => (
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
                      Charged per {svc?.unit}. Final count verified at pickup.
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
                sub={`We collect, clean at our facility and return in ${settings.deliveryDays * 24}–${(settings.deliveryDays + 1) * 24} hours. Within ${settings.radiusKm} km.`}
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
                  {localities.map((l) => (
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
                      <strong>
                        {km} km — outside the {settings.radiusKm} km pickup radius.
                      </strong>{" "}
                      Pickup is unavailable here, but on-site cleaning is still covered. We've
                      switched your booking to on-site.
                    </>
                  )}
                </div>
              )}
              <Field label="Full address">
                <textarea
                  value={address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddress(`${val} [GPS: ${mapLat.toFixed(6)}, ${mapLng.toFixed(6)}]`);
                  }}
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
              <MapPicker
                lat={mapLat}
                lng={mapLng}
                onChange={(la, ln) => {
                  setMapLat(la);
                  setMapLng(ln);
                  setAddress("Resolving address from map...");
                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${la}&lon=${ln}&accept-language=en`)
                    .then((res) => res.json())
                    .then((data) => {
                      if (data && data.display_name) {
                        setAddress(`${data.display_name} [GPS: ${la.toFixed(6)}, ${ln.toFixed(6)}]`);
                      } else {
                        setAddress(`[GPS: ${la.toFixed(6)}, ${ln.toFixed(6)}]`);
                      }
                    })
                    .catch(() => {
                      setAddress(`[GPS: ${la.toFixed(6)}, ${ln.toFixed(6)}]`);
                    });
                }}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold">Choose a date</p>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {days.map((d) => {
                    const iso = toISODate(d);
                    const reason = blocked[iso];
                    const off = !!reason;
                    const on = date === iso;
                    return (
                      <button
                        key={iso}
                        disabled={off}
                        onClick={() => setDate(iso)}
                        title={off ? reason : undefined}
                        className={`relative min-w-[74px] shrink-0 rounded-2xl border px-3 py-4 text-center transition-all duration-300 group/date ${
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
                        {off && (
                          <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-[10px] font-bold text-white shadow-lg opacity-0 group-hover/date:opacity-100 transition-opacity duration-200 z-20">
                            {reason}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {date && (
                <div className="reveal">
                  <p className="text-sm font-semibold">Choose a 2-hour slot</p>
                  {!slots && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Checking live availability…
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(slots ?? []).map((s) => {
                      const isFull = s.remaining <= 0;
                      const active = slot === s.slot;
                      return (
                        <button
                          key={s.slot}
                          disabled={isFull}
                          onClick={() => setSlot(s.slot)}
                          className={`rounded-2xl border px-4 py-4 text-sm transition-all duration-300 text-left ${
                            active
                              ? "border-transparent bg-navy-gradient text-white shadow-lift"
                              : isFull
                                ? "border-border bg-secondary opacity-40 cursor-not-allowed"
                                : "border-border bg-card hover:-translate-y-1 hover:shadow-soft cursor-pointer"
                          }`}
                        >
                          <span className="block font-semibold">{s.slot}</span>
                          <span
                            className={`mt-1 block text-xs ${
                              active
                                ? "text-white/60"
                                : isFull
                                  ? "text-rose-500 font-semibold"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {isFull ? "Fully Booked" : `${s.remaining} slot${s.remaining > 1 ? "s" : ""} left`}
                          </span>
                        </button>
                      );
                    })}
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
                <Input
                  value={phone}
                  onChange={setPhone}
                  maxLength={15}
                  placeholder="10-digit mobile"
                />
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
                  <Row k="Service" v={`${svc?.name ?? "-"} × ${qty}`} />
                  <Row k="Mode" v={mode === "pickup" ? "Pickup & delivery" : "On-site cleaning"} />
                  <Row
                    k="Date & slot"
                    v={`${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${slot}`}
                  />
                  <Row k="Address" v={`${address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "")}, ${locality}`} />
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

        {step <= 5 && (
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm font-semibold text-muted-foreground disabled:opacity-30 cursor-pointer"
            >
              ← Back
            </button>
            {step < 5 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
                className="rounded-full bg-navy-gradient px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 cursor-pointer"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </main>

      {/* Simulated Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-3xl bg-card border border-border/80 p-8 shadow-lift overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-royal/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Secure Checkout</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">SpinShine Pay Gateway</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={paySimulating || paySuccess}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition-colors disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {paySimulating ? (
              <div className="py-12 text-center space-y-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-royal border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="text-sm font-semibold text-foreground">Processing payment of ₹{price}...</p>
                <p className="text-xs text-muted-foreground">Please do not refresh the page or hit back.</p>
              </div>
            ) : paySuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15 text-teal text-3xl animate-bounce">
                  ✓
                </div>
                <p className="text-sm font-bold text-foreground">Payment Successful!</p>
                <p className="text-xs text-muted-foreground">Confirming your slot and finishing booking...</p>
              </div>
            ) : payment === "upi" ? (
              <div className="space-y-6">
                <p className="text-xs text-muted-foreground text-center">
                  Scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to complete payment.
                </p>
                
                {/* Simulated QR Code */}
                <div className="mx-auto w-48 h-48 bg-white border-2 border-border p-3 rounded-2xl flex flex-col items-center justify-center shadow-soft relative overflow-hidden group">
                  <div className="w-full h-full bg-grid-pattern opacity-80 flex items-center justify-center">
                    {/* Simulated QR code grid */}
                    <div className="w-40 h-40 border-8 border-navy rounded flex flex-wrap p-2 gap-1.5 opacity-80">
                      <div className="w-10 h-10 border-4 border-navy rounded-sm" />
                      <div className="flex-1 flex flex-wrap gap-1">
                        <div className="w-3 h-3 bg-navy rounded-sm" />
                        <div className="w-3 h-3 bg-navy rounded-sm" />
                        <div className="w-3 h-3 bg-navy rounded-sm" />
                      </div>
                      <div className="w-full flex justify-between">
                        <div className="w-10 h-10 border-4 border-navy rounded-sm" />
                        <div className="w-10 h-10 border-4 border-navy rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-navy/90 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                    <span className="text-xs font-bold">SpinShine UPI Portal</span>
                    <span className="text-[10px] text-teal mt-1">₹{price}</span>
                  </div>
                </div>

                <div className="text-center bg-secondary/40 py-2.5 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Amount to Pay</span>
                  <p className="text-lg font-black text-foreground mt-0.5">₹{price}</p>
                </div>

                <button
                  onClick={async () => {
                    setPaySimulating(true);
                    setTimeout(async () => {
                      setPaySimulating(false);
                      setPaySuccess(true);
                      setTimeout(async () => {
                        const success = await executeBooking();
                        if (success) {
                          setShowPaymentModal(false);
                        } else {
                          setPaySuccess(false);
                        }
                      }, 1000);
                    }, 1800);
                  }}
                  className="w-full rounded-full bg-navy-gradient py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Simulate GPay/PhonePe Success
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground text-center">
                  Enter your card details to complete the payment simulation.
                </p>

                {/* Simulated Glassmorphic Credit Card Preview */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-navy to-royal border border-white/10 p-5 text-white flex flex-col justify-between shadow-lift relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold tracking-widest uppercase text-white/50">SpinShine Premium</span>
                    <span className="text-sm font-black italic">VISA</span>
                  </div>
                  <div className="font-mono text-base tracking-widest text-white/90 py-2">
                    {cardNo.padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim()}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] text-white/40 block uppercase tracking-wider">Card Holder</span>
                      <span className="text-xs font-bold tracking-wide uppercase">{cardHolder || "Your Name"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-white/40 block uppercase tracking-wider">Expires</span>
                      <span className="text-xs font-bold tracking-wide">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    value={cardHolder}
                    onChange={setCardHolder}
                    placeholder="Cardholder Name"
                  />
                  <Input
                    value={cardNo}
                    onChange={(v) => setCardNo(v.replace(/\D/g, "").slice(0, 16))}
                    placeholder="Card Number (16 Digits)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={cardExpiry}
                      onChange={(v) => setCardExpiry(v.slice(0, 5))}
                      placeholder="MM/YY"
                    />
                    <Input
                      value={cardCvv}
                      onChange={(v) => setCardCvv(v.replace(/\D/g, "").slice(0, 3))}
                      placeholder="CVV"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (cardNo.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
                      alert("Please fill in valid mock card credentials.");
                      return;
                    }
                    setPaySimulating(true);
                    setTimeout(async () => {
                      setPaySimulating(false);
                      setPaySuccess(true);
                      setTimeout(async () => {
                        const success = await executeBooking();
                        if (success) {
                          setShowPaymentModal(false);
                        } else {
                          setPaySuccess(false);
                        }
                      }, 1000);
                    }, 1800);
                  }}
                  className="w-full rounded-full bg-navy-gradient py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Pay ₹{price} (Simulate Gateway)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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

function Stepper({
  step,
  setStep,
  maxStep,
}: {
  step: number;
  setStep: (s: number) => void;
  maxStep: number;
}) {
  return (
    <div className="mt-10 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <button
          key={s}
          disabled={i > maxStep}
          onClick={() => setStep(i)}
          className="flex-1 text-left focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          <div>
            <div className="h-1 overflow-hidden rounded-full bg-border group-hover:bg-border/80 transition-colors">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-accent)] transition-all duration-700"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
            <span
              className={`mt-2 hidden text-xs sm:block transition-colors ${
                i === step ? "text-foreground font-bold" : i < step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
          </div>
        </button>
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
  phone,
}: {
  orderRef: string;
  date: string;
  slot: string;
  price: number;
  phone: string;
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
            search={{ ref: orderRef, phone }}
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

import { useRef as lRef } from "react";

function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const mapRef = lRef<HTMLDivElement>(null);
  const leafletMap = lRef<any>(null);
  const markerRef = lRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      if ((window as any).L) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadLeaflet().then(() => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current).setView([lat, lng], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(leafletMap.current);

        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(leafletMap.current);

        markerRef.current.on("dragend", () => {
          const position = markerRef.current.getLatLng();
          onChange(position.lat, position.lng);
        });

        leafletMap.current.on("click", (e: any) => {
          markerRef.current.setLatLng(e.latlng);
          onChange(e.latlng.lat, e.latlng.lng);
        });
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (L && leafletMap.current && markerRef.current) {
      const currentCenter = leafletMap.current.getCenter();
      if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
        leafletMap.current.setView([lat, lng], 14);
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold">Pinpoint exact address</span>
        <span className="text-[10px] text-teal bg-teal/5 px-2 py-0.5 rounded border border-teal/20 font-mono">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </span>
      </div>
      <div
        ref={mapRef}
        className="h-64 rounded-2xl border border-border overflow-hidden bg-secondary shadow-soft z-10"
        style={{ minHeight: "260px" }}
      />
      <p className="text-[10px] text-muted-foreground mt-1">
        Drag the marker or click on the map to pinpoint your exact home location for the technician/driver.
      </p>
    </div>
  );
}
