import { useMemo } from "react";
import { User, Truck, ShieldAlert, Compass, Play } from "lucide-react";
import type { BookingRow, UserRow } from "./types";
import { STAGE_LABELS } from "@/lib/booking";

type Props = {
  bookings: BookingRow[];
  users: UserRow[];
  onAssign: (bookingId: string, column: "technician" | "driver", userId: string | null) => Promise<void>;
  onChanged: () => void;
};

export function DispatchBoard({ bookings, users, onAssign, onChanged }: Props) {
  const technicians = users.filter((u) => u.role === "technician");
  const drivers = users.filter((u) => u.role === "driver");

  const unassigned = useMemo(() => {
    return bookings.filter(
      (b) => b.status !== "cancelled" && b.status !== "delivered" && (!b.assigned_technician_id || !b.assigned_driver_id)
    );
  }, [bookings]);

  // Group bookings by driver/tech assignments
  const driverAssignments = useMemo(() => {
    const map: Record<string, BookingRow[]> = {};
    drivers.forEach((d) => {
      map[d.id] = bookings.filter((b) => b.assigned_driver_id === d.id && b.status !== "delivered" && b.status !== "cancelled");
    });
    return map;
  }, [bookings, drivers]);

  const techAssignments = useMemo(() => {
    const map: Record<string, BookingRow[]> = {};
    technicians.forEach((t) => {
      map[t.id] = bookings.filter((b) => b.assigned_technician_id === t.id && b.status !== "delivered" && b.status !== "cancelled");
    });
    return map;
  }, [bookings, technicians]);

  async function handleAutoAssign() {
    if (unassigned.length === 0) return alert("All bookings are already assigned!");
    
    // Auto-match ONLY to crew who are ON DUTY
    const activeTechs = technicians.filter((t) => t.is_on_duty !== false);
    const activeDrivers = drivers.filter((d) => d.is_on_duty !== false);

    if (activeTechs.length === 0 && activeDrivers.length === 0) {
      alert("No active crew members are currently ON DUTY to dispatch!");
      return;
    }
    
    let count = 0;
    for (const b of unassigned) {
      // Find active technician with least load
      if (!b.assigned_technician_id && activeTechs.length > 0) {
        const leastTech = activeTechs.reduce((prev, curr) => {
          const loadPrev = techAssignments[prev.id]?.length || 0;
          const loadCurr = techAssignments[curr.id]?.length || 0;
          return loadPrev < loadCurr ? prev : curr;
        });
        await onAssign(b.id, "technician", leastTech.id);
        count++;
      }

      // Find active driver with least load
      if (!b.assigned_driver_id && activeDrivers.length > 0) {
        const leastDriver = activeDrivers.reduce((prev, curr) => {
          const loadPrev = driverAssignments[prev.id]?.length || 0;
          const loadCurr = driverAssignments[curr.id]?.length || 0;
          return loadPrev < loadCurr ? prev : curr;
        });
        await onAssign(b.id, "driver", leastDriver.id);
        count++;
      }
    }

    onChanged();
    alert(`Automatically dispatched ${count} assignments based on ON DUTY workloads.`);
  }

  return (
    <div className="space-y-6">
      {/* Dispatch KPI Stats */}
      <div className="grid gap-4 grid-cols-3">
        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Unassigned Shipments</span>
            <span className="text-xl font-black text-foreground block mt-0.5">{unassigned.length}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-royal/10 border border-royal/20 text-royal rounded-xl">
            <Truck size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Active Drivers</span>
            <span className="text-xl font-black text-foreground block mt-0.5">{drivers.filter(d=>d.is_on_duty !== false).length} / {drivers.length}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-teal/10 border border-teal/20 text-teal rounded-xl">
            <Compass size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Lead Care Techs</span>
            <span className="text-xl font-black text-foreground block mt-0.5">{technicians.filter(t=>t.is_on_duty !== false).length} / {technicians.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Unassigned List Panel */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-soft flex flex-col h-[550px]">
          <div className="flex justify-between items-center pb-3 border-b border-border gap-2">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Pending Dispatch</h2>
              <p className="text-[9px] text-muted-foreground mt-0.5">Awaiting driver or technician allocation</p>
            </div>
            {unassigned.length > 0 && (
              <button
                onClick={handleAutoAssign}
                className="px-3 py-1.5 bg-teal text-white hover:bg-teal/95 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-lift"
              >
                <Play size={10} /> Auto Load
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 custom-scrollbar">
            {unassigned.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center">
                All appointments successfully dispatched.
              </div>
            ) : (
              unassigned.map((b) => (
                <div key={b.id} className="p-3 border border-border bg-secondary/20 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-black text-royal text-[10px]">{b.order_ref}</span>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">{b.pickup_slot}</span>
                  </div>
                  <p className="font-bold text-foreground">{b.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{b.address?.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "")}</p>
                  <div className="flex gap-2.5 pt-1 text-[9px] font-extrabold uppercase text-muted-foreground">
                    <span className={b.assigned_technician_id ? "text-teal" : "text-amber-500"}>
                      Tech: {b.assigned_technician_id ? "OK" : "MISSING"}
                    </span>
                    <span className={b.assigned_driver_id ? "text-teal" : "text-amber-500"}>
                      Driver: {b.assigned_driver_id ? "OK" : "MISSING"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Assigned Crew Grid */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-soft flex flex-col h-[550px]">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Logistics Crew Dispatch Board</h2>
            <p className="text-[9px] text-muted-foreground mt-0.5">Real-time status assignments and workloads grouped by staff member</p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1 custom-scrollbar">
            {/* Drivers load */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Truck size={12} /> Driver Routing ({drivers.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {drivers.map((d) => {
                  const jobs = driverAssignments[d.id] || [];
                  const isOnDuty = d.is_on_duty !== false;
                  return (
                    <div key={d.id} className="p-4 border border-border bg-secondary/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">{d.full_name || "Unnamed Driver"}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${isOnDuty ? "bg-teal/10 text-teal" : "bg-red-500/10 text-red-500"}`}>
                              {isOnDuty ? "On Duty" : "Off Duty"}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{d.phone || "No phone linked"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-royal/10 text-royal text-[9px] font-extrabold">
                          {jobs.length} jobs
                        </span>
                      </div>
                      {jobs.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {jobs.map((j) => (
                            <div key={j.id} className="flex justify-between text-[9px] font-semibold border-b border-border pb-1">
                              <span className="text-royal font-bold">{j.order_ref}</span>
                              <span className="text-foreground uppercase">{STAGE_LABELS[j.status] || j.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-muted-foreground italic pt-2">No active logistics routes today.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-border" />

            {/* Technicians load */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <User size={12} /> Technician Assignments ({technicians.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {technicians.map((t) => {
                  const jobs = techAssignments[t.id] || [];
                  const isOnDuty = t.is_on_duty !== false;
                  return (
                    <div key={t.id} className="p-4 border border-border bg-secondary/10 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-foreground">{t.full_name || "Unnamed Tech"}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${isOnDuty ? "bg-teal/10 text-teal" : "bg-red-500/10 text-red-500"}`}>
                              {isOnDuty ? "On Duty" : "Off Duty"}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{t.phone || "No phone linked"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[9px] font-extrabold">
                          {jobs.length} treatments
                        </span>
                      </div>
                      {jobs.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {jobs.map((j) => (
                            <div key={j.id} className="flex justify-between text-[9px] font-semibold border-b border-border pb-1">
                              <span className="text-royal font-bold">{j.order_ref}</span>
                              <span className="text-foreground uppercase">{STAGE_LABELS[j.status] || j.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-muted-foreground italic pt-2">No active treatment slots today.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
