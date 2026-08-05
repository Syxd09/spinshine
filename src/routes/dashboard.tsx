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
      setRole(res.role);
      setAuthState("ready");
      load();
    })();
  }, [load]);

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
            <div className="flex gap-3">
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

              {bookings.map((b) => {
                const current = STAGE_LABELS[b.status] ?? b.status;
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
                          {b.service}
                        </h3>
                      </div>
                      <span className="rounded-full bg-teal/10 border border-teal/20 text-teal px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                        {current}
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
                        {isDriver ? "Return:" : "Customer:"}{" "}
                        <span className="font-bold text-foreground">
                          {isDriver
                            ? b.delivery_date
                              ? `${new Date(b.delivery_date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })} · ${b.delivery_slot ?? b.pickup_slot}`
                              : "—"
                            : b.customer_name}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        Address:{" "}
                        <span className="font-bold text-foreground">
                          {(() => {
                            const match = (b.address || "").match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
                            if (match && b.address) {
                              const cleanAddress = (b.address || "").replace(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/, "").trim();
                              return (
                                <>
                                  {cleanAddress}{" "}
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${match[1]},${match[2]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-teal hover:underline ml-1 font-extrabold text-[10px]"
                                  >
                                    📍 View Map
                                  </a>
                                </>
                              );
                            }
                            return b.address;
                          })()}
                        </span>
                      </p>
                      {b.phone && (
                        <p className="text-muted-foreground">
                          Phone: <span className="font-bold text-foreground">{b.phone}</span>
                        </p>
                      )}
                    </div>

                    {b.status !== "cancelled" && b.status !== "delivered" && (
                      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                        {actions.map((s) => (
                          <button
                            key={s}
                            disabled={b.status === s}
                            onClick={() => handleAdvance(b.id, s)}
                            className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            {STAGE_LABELS[s] ?? s}
                          </button>
                        ))}
                      </div>
                    )}
                  </SpotlightCard>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
