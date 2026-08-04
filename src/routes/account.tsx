import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { supabase } from "@/integrations/supabase/client";
import { getMyBookings, cancelMyBooking, rescheduleMyBooking } from "@/lib/customer-actions";
import { getMyRole } from "@/lib/admin-actions";
import { STAGE_LABELS, nextDays, toISODate } from "@/lib/booking";
import { SLOTS, type BookingRow } from "@/features/admin/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My Account — SpinShine" }],
  }),
  component: AccountPage,
});

type AuthState = "loading" | "guest" | "ready";

const CANCELLATION_MS = 12 * 60 * 60 * 1000;

function canManage(pickupDate: string): boolean {
  return new Date(`${pickupDate}T00:00:00`).getTime() - Date.now() >= CANCELLATION_MS;
}

function AccountPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reschedule, setReschedule] = useState<{ id: string; date: string; slot: string } | null>(
    null,
  );

  const days = nextDays(14);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getMyBookings();
    if (res.success) setBookings((res.data as unknown as BookingRow[]) ?? []);
    else setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setAuthState("guest");
        return;
      }
      setAuthState("ready");
      load();
    })();
  }, [load]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking? This can only be done at least 12 hours before pickup."))
      return;
    setMessage(null);
    setError(null);
    const res = await cancelMyBooking({ data: { id } });
    if (res.success) {
      setMessage("Booking cancelled.");
      await load();
    } else {
      setError(res.error);
    }
  }

  async function handleReschedule(id: string) {
    if (!reschedule || reschedule.id !== id) return;
    setMessage(null);
    setError(null);
    const res = await rescheduleMyBooking({
      data: {
        id: reschedule.id,
        pickup_date: reschedule.date,
        pickup_slot: reschedule.slot,
      },
    });
    if (res.success) {
      setReschedule(null);
      setMessage("Booking rescheduled.");
      await load();
    } else {
      setError(res.error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await router.invalidate();
    await router.navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground">My Account</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Your bookings, cancellations and rescheduling.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/book"
                className="rounded-full bg-navy text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-royal transition-colors"
              >
                Book a pickup
              </Link>
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
              <h2 className="text-xl font-extrabold font-display">Sign in to see your orders</h2>
              <p className="text-xs text-white/50">
                Bookings made while signed in are linked to your account.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 px-8 text-xs font-bold uppercase tracking-wider text-white"
              >
                Sign in / Create account
              </Link>
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
              {loading && <p className="text-xs text-muted-foreground">Loading your orders…</p>}

              {!loading && bookings.length === 0 && (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
                  <p className="text-sm font-bold text-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Book your first pickup to see it here.
                  </p>
                </div>
              )}

              {bookings.map((b) => (
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
                        {b.service}
                      </h3>
                    </div>
                    <span className="rounded-full bg-teal/10 border border-teal/20 text-teal px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                      {STAGE_LABELS[b.status] ?? b.status}
                    </span>
                  </div>

                  <div className="grid gap-3 text-xs sm:grid-cols-2">
                    <p className="text-muted-foreground">
                      Pickup:{" "}
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
                      Estimated:{" "}
                      <span className="font-bold text-foreground">
                        ₹{b.estimated_price}
                        {b.qty ? ` · qty ${b.qty}` : ""}
                      </span>
                    </p>
                  </div>

                  {reschedule?.id === b.id ? (
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end border-t border-border pt-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-muted-foreground">
                          New date
                        </label>
                        <select
                          value={reschedule.date}
                          onChange={(e) =>
                            setReschedule({ ...reschedule, date: e.target.value })
                          }
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        >
                          {days.map((d) => (
                            <option key={d.toISOString()} value={toISODate(d)}>
                              {d.toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-muted-foreground">
                          New slot
                        </label>
                        <select
                          value={reschedule.slot}
                          onChange={(e) =>
                            setReschedule({ ...reschedule, slot: e.target.value })
                          }
                          className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
                        >
                          {SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleReschedule(b.id)}
                        className="rounded-full bg-navy text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-royal transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                      <Link
                        to="/track"
                        className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-colors"
                      >
                        Track
                      </Link>
                      {b.status !== "cancelled" && b.status !== "delivered" && canManage(b.pickup_date) && (
                        <>
                          <button
                            onClick={() =>
                              setReschedule({ id: b.id, date: b.pickup_date, slot: b.pickup_slot })
                            }
                            className="rounded-full border border-royal/30 bg-royal/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-royal hover:bg-royal/10 transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="rounded-full border border-royal/30 bg-royal/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-royal hover:bg-royal/10 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status !== "cancelled" && !canManage(b.pickup_date) && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          Rescheduling/cancelling closes 12h before pickup.
                        </span>
                      )}
                    </div>
                  )}
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
