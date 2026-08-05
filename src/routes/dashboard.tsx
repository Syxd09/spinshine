import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, makeMeStaff } from "@/lib/admin-actions";
import { getMyAssignedBookings, advanceAssignedStatus } from "@/lib/staff-actions";
import { STAGE_LABELS } from "@/lib/booking";
import type { BookingRow } from "@/features/admin/types";
import { MessageSquare, Navigation, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Team Dashboard — SpinShine" }],
  }),
  component: DashboardPage,
});

type AuthState = "loading" | "guest" | "forbidden" | "ready";

const TECHNICIAN_ACTIONS = ["collected", "cleaning", "drying", "quality_check"];
const DRIVER_ACTIONS = ["out_for_delivery", "delivered"];

function DashboardPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");

  const [isOnDuty, setIsOnDuty] = useState(true);

  async function promoteToStaff(targetRole: "technician" | "driver") {
    setLoading(true);
    const res = await makeMeStaff({ data: { role: targetRole } });
    if (res.success) {
      window.location.reload();
    } else {
      alert("Failed to promote: " + res.error);
      setLoading(false);
    }
  }
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getMyAssignedBookings();
    if (res.success) setBookings((res.data as unknown as BookingRow[]) ?? []);
    else setError(res.error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setAuthState("guest");
        return;
      }
      const res = await getMyRole();
      if (!res.success || res.role === "customer") {
        setAuthState("forbidden");
        return;
      }

      // Query duty status
      const { data: profileData } = await (supabase as any)
        .from("profiles")
        .select("is_on_duty")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (profileData) {
        setIsOnDuty(profileData.is_on_duty);
      }

      setRole(res.role);
      setAuthState("ready");
      load();
    })();
  }, [load]);

  async function toggleDuty() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const nextDuty = !isOnDuty;
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ is_on_duty: nextDuty })
        .eq("id", session.user.id);
      
      if (error) {
        alert("Error updating duty status: " + error.message);
      } else {
        setIsOnDuty(nextDuty);
        setMessage(`Duty status updated to ${nextDuty ? "ON DUTY" : "OFF DUTY"}.`);
      }
    } catch(err) {
      console.error(err);
    }
  }

  async function handleAdvance(id: string, status: string) {
    setMessage(null);
    setError(null);
    const res = await advanceAssignedStatus({ data: { id, status } });
    if (res.success) {
      setMessage(`Booking marked as "${status}".`);
      await load();
    } else {
      setError(res.error ?? null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    await router.navigate({ to: "/" });
  }

  const actions = role === "technician" ? TECHNICIAN_ACTIONS : DRIVER_ACTIONS;
  const isDriver = role === "driver";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground">
                {isDriver ? "Delivery Dashboard" : "Technician Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Your assigned jobs, in pickup order. Update status as you progress.
              </p>
            </div>
             <div className="flex gap-3 items-center">
              {authState === "ready" && (
                <button
                  onClick={toggleDuty}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isOnDuty
                      ? "bg-teal/10 border border-teal/20 text-teal hover:bg-teal/15"
                      : "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/15"
                  }`}
                >
                  ● {isOnDuty ? "On Duty" : "Off Duty"}
                </button>
              )}
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-full bg-navy text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-royal transition-colors"
                >
                  Admin panel
                </Link>
              )}
              <button
                onClick={signOut}
                className="rounded-full border border-border bg-background px-4.5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {authState === "guest" && (
            <SpotlightCard
              glowColor="rgba(20, 184, 166, 0.15)"
              borderColor="rgba(110, 68, 255, 0.25)"
              className="w-full"
              innerClassName="!bg-navy/95 p-8 space-y-5 text-center text-white rounded-[inherit]"
            >
              <h2 className="text-xl font-extrabold font-display">Staff sign in required</h2>
              <p className="text-xs text-white/50">
                Sign in with your technician or driver account to see your assignments.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 px-8 text-xs font-bold uppercase tracking-wider text-white"
              >
                Sign in
              </Link>
            </SpotlightCard>
          )}

          {authState === "forbidden" && (
            <SpotlightCard
              glowColor="rgba(20, 184, 166, 0.15)"
              borderColor="rgba(110, 68, 255, 0.25)"
              className="w-full"
              innerClassName="!bg-navy/95 p-8 space-y-5 text-center text-white rounded-[inherit]"
            >
              <h2 className="text-xl font-extrabold font-display">No assignments</h2>
              <p className="text-xs text-white/50">
                This dashboard is for technicians and drivers. Customers can manage their orders
                from their account page.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/account"
                  className="rounded-xl border border-white/20 hover:bg-white/10 py-3 px-6 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                >
                  My account
                </Link>
                <button
                  disabled={loading}
                  onClick={() => promoteToStaff("technician")}
                  className="rounded-xl bg-teal py-3 px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-teal/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  Become Technician
                </button>
                <button
                  disabled={loading}
                  onClick={() => promoteToStaff("driver")}
                  className="rounded-xl bg-royal py-3 px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-royal/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  Become Driver
                </button>
              </div>
            </SpotlightCard>
          )}

          {authState === "ready" && (
            <div className="space-y-5">
              {message && (
                <p className="text-xs font-bold text-teal bg-teal/5 border border-teal/20 p-4 rounded-xl">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs font-bold text-royal bg-royal/5 border border-royal/10 p-4 rounded-xl">
                  {error}
                </p>
              )}
              {loading && <p className="text-xs text-muted-foreground">Loading assignments…</p>}

              {!loading && bookings.length === 0 && (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                  <p className="text-sm font-bold text-foreground">No assignments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    The admin will assign bookings to you from the admin panel.
                  </p>
                </div>
              )}
              
              {!loading && bookings.length > 0 && (
                <DashboardBookingsList 
                  bookings={bookings} 
                  actions={actions} 
                  handleAdvance={handleAdvance} 
                  load={load} 
                />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DashboardBookingsList({
  bookings,
  actions,
  handleAdvance,
  load,
}: {
  bookings: BookingRow[];
  actions: string[];
  handleAdvance: (id: string, status: string) => Promise<void>;
  load: () => Promise<void>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  async function handleSaveNotes(bookingId: string) {
    const text = notes[bookingId];
    if (text === undefined) return;
    setSavingNotes((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ notes: text })
        .eq("id", bookingId);
      if (error) alert("Error saving notes: " + error.message);
      else {
        alert("Crew operational notes updated successfully.");
        await load();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes((prev) => ({ ...prev, [bookingId]: false }));
    }
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const isExpanded = expandedId === b.id;
        const current = STAGE_LABELS[b.status as keyof typeof STAGE_LABELS] ?? b.status;
        const cleanAddress = (b.address || "").replace(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/, "").trim();
        const gpsMatch = (b.address || "").match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
        const mapsLink = gpsMatch
          ? `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`
          : null;
        const waLink = `https://wa.me/${b.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Hi ${b.customer_name}, this is your SpinShine Care specialist. I am following up on your order ${b.order_ref}.`
        )}`;

        if (notes[b.id] === undefined && b.notes !== undefined) {
          setNotes((prev) => ({ ...prev, [b.id]: b.notes || "" }));
        }

        return (
          <SpotlightCard
            key={b.id}
            className="p-px"
            innerClassName="p-6 bg-card rounded-[20px] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {b.order_ref}
                </span>
                <h3 className="font-display text-lg font-black text-foreground">
                  {(b.service || "Fabric Care").toUpperCase()}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal/10 border border-teal/20 text-teal px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                  {current}
                </span>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="px-3.5 py-1.5 border border-border rounded-xl bg-background hover:bg-secondary text-xs font-bold transition-all cursor-pointer"
                >
                  {isExpanded ? "Collapse" : "Inspect"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <p className="text-muted-foreground">
                Scheduled Pickup:{" "}
                <span className="font-bold text-foreground">
                  {new Date(b.pickup_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {b.pickup_slot}
                </span>
              </p>
              <p className="text-muted-foreground">
                Customer Name: <span className="font-bold text-foreground">{b.customer_name}</span>
              </p>
              <p className="text-muted-foreground sm:col-span-2">
                Full Address: <span className="font-bold text-foreground">{cleanAddress}</span>
              </p>
            </div>

            {isExpanded && (
              <div className="border-t border-border pt-4 mt-2 space-y-4 animate-fade-in text-xs">
                <div className="grid gap-3 grid-cols-2">
                  {mapsLink && (
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 p-3 border border-teal/25 bg-teal/5 text-teal hover:bg-teal/10 transition-colors rounded-xl font-bold uppercase tracking-wider text-[10px]"
                    >
                      <Navigation size={14} /> Open Navigation
                    </a>
                  )}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-3 border border-emerald/25 bg-emerald/5 text-emerald hover:bg-emerald/10 transition-colors rounded-xl font-bold uppercase tracking-wider text-[10px]"
                  >
                    <MessageSquare size={14} /> WhatsApp customer
                  </a>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                    <ClipboardList size={12} /> Treatment Items Invoice
                  </h4>
                  <div className="bg-secondary/30 rounded-xl p-3.5 space-y-1.5 border border-border">
                    {(b.line_items as any[] ?? []).map((li, idx) => (
                      <div key={idx} className="flex justify-between font-semibold">
                        <span>{li.name || li.service} x{li.qty}</span>
                        <span>₹{li.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-royal pt-1.5 border-t border-border mt-1">
                      <span>Total Value</span>
                      <span>₹{b.estimated_price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                    Crew Operational Notes (Visible to Admin)
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={notes[b.id] ?? ""}
                      onChange={(e) => setNotes({ ...notes, [b.id]: e.target.value })}
                      rows={2}
                      className="flex-1 p-2.5 rounded-xl border border-border bg-background outline-none resize-none font-medium"
                      placeholder="Add status notes (e.g. stains identified, gate code, customer phone unreachable)..."
                    />
                    <button
                      onClick={() => handleSaveNotes(b.id)}
                      disabled={savingNotes[b.id]}
                      className="px-4 bg-navy hover:bg-royal text-white rounded-xl font-bold uppercase tracking-widest text-[9px] disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {savingNotes[b.id] ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {b.status !== "cancelled" && b.status !== "delivered" && (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {actions.map((s) => (
                  <button
                    key={s}
                    disabled={b.status === s}
                    onClick={() => handleAdvance(b.id, s)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    {STAGE_LABELS[s as keyof typeof STAGE_LABELS] ?? s}
                  </button>
                ))}
              </div>
            )}
          </SpotlightCard>
        );
      })}
    </div>
  );
}
