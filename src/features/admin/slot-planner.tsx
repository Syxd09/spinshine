import { useMemo, useState } from "react";
import { Calendar, ShieldAlert, CheckCircle, Flame } from "lucide-react";
import type { BookingRow } from "./types";
import { addBlockedDate } from "@/lib/admin-actions";

type Props = {
  bookings: BookingRow[];
  capacityPerSlot: number;
  onChanged: () => void;
};

const SLOTS = ["09:00 - 12:00 (Morning)", "12:00 - 15:00 (Afternoon)", "15:00 - 18:00 (Evening)"];

export function SlotPlanner({ bookings, capacityPerSlot, onChanged }: Props) {
  const [selectedDayOrders, setSelectedDayOrders] = useState<BookingRow[]>([]);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<{ date: string; slot: string } | null>(null);

  // Generate next 14 days starting from today
  const next14Days = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      dates.push(next.toISOString().split("T")[0]!);
    }
    return dates;
  }, []);

  // Compute load state for date + slots
  const slotCapacityMap = useMemo(() => {
    const map: Record<string, BookingRow[]> = {};
    bookings.forEach((b) => {
      if (b.pickup_date && b.pickup_slot && b.status !== "cancelled") {
        const key = `${b.pickup_date}::${b.pickup_slot}`;
        if (!map[key]) map[key] = [];
        map[key]!.push(b);
      }
    });
    return map;
  }, [bookings]);

  async function handleQuickBlock(date: string, slot: string) {
    if (!confirm(`Are you sure you want to block all appointments for ${date} during ${slot}?`)) return;
    const res = await addBlockedDate({ data: { date, reason: `Admin Block: ${slot}` } });
    if (res.success) {
      onChanged();
      alert("Date slot blocked successfully.");
    } else {
      alert("Error: " + res.error);
    }
  }

  function handleSelectSlot(date: string, slot: string, list: BookingRow[]) {
    setSelectedDayOrders(list);
    setSelectedSlotDetails({ date, slot });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
          <Calendar size={16} /> Operational Capacity Visualizer
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Visual matrix of slots and capacity loads over the next 14 calendar days (Max capacity per slot: {capacityPerSlot})
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        {/* Capacity Matrix Grid */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-soft overflow-x-auto">
          <div className="min-w-[650px] space-y-4">
            <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4 text-center font-extrabold text-[9px] uppercase text-muted-foreground border-b border-border pb-3">
              <span className="text-left">Calendar Date</span>
              <span>Morning Slot</span>
              <span>Afternoon Slot</span>
              <span>Evening Slot</span>
            </div>

            <div className="space-y-3.5">
              {next14Days.map((d) => {
                const dateLabel = new Date(d).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                });
                return (
                  <div key={d} className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4 items-center text-xs">
                    <span className="font-bold text-foreground text-left">{dateLabel}</span>

                    {SLOTS.map((s) => {
                      const key = `${d}::${s}`;
                      const list = slotCapacityMap[key] || [];
                      const count = list.length;
                      const ratio = count / capacityPerSlot;

                      // Decide color-coding based on ratio
                      let bg = "bg-secondary/40 border-transparent text-muted-foreground";
                      let indicator = "bg-muted-foreground/30";
                      if (count > 0) {
                        if (ratio >= 1.0) {
                          bg = "bg-red-500/10 border-red-500/25 text-red-500 font-extrabold";
                          indicator = "bg-red-500 animate-pulse";
                        } else if (ratio >= 0.6) {
                          bg = "bg-amber-500/10 border-amber-500/25 text-amber-500 font-bold";
                          indicator = "bg-amber-500";
                        } else {
                          bg = "bg-emerald/10 border-emerald/25 text-emerald font-bold";
                          indicator = "bg-emerald";
                        }
                      }

                      return (
                        <div
                          key={s}
                          onClick={() => handleSelectSlot(d, s, list)}
                          className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-soft ${bg}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${indicator}`} />
                            <span className="font-mono text-[10px]">{count} / {capacityPerSlot}</span>
                          </div>
                          {count === 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickBlock(d, s);
                              }}
                              className="text-[8px] font-extrabold uppercase bg-background hover:bg-secondary border border-border px-2 py-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
                            >
                              Block
                            </button>
                          ) : (
                            <span className="text-[8px] uppercase tracking-wide opacity-85 font-extrabold">Inspect</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Slot Inspector Panel */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-soft flex flex-col h-[550px]">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Slot Booking Load</h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">Line breakdown of active orders assigned to the highlighted slot</p>
          </div>

          {selectedSlotDetails ? (
            <div className="flex-1 flex flex-col mt-4">
              <div className="p-3 bg-secondary/30 border border-border rounded-xl mb-4 text-xs font-semibold space-y-1">
                <p className="text-foreground font-bold">Highlighted slot details:</p>
                <p className="text-royal font-black">{selectedSlotDetails.date}</p>
                <p className="text-muted-foreground">{selectedSlotDetails.slot}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {selectedDayOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center italic">
                    No orders scheduled in this slot.
                  </div>
                ) : (
                  selectedDayOrders.map((j) => (
                    <div key={j.id} className="p-3 border border-border bg-background rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-black text-royal text-[10px]">{j.order_ref}</span>
                        <span className="font-extrabold text-[9px] text-teal">{j.mode.toUpperCase()}</span>
                      </div>
                      <p className="font-bold text-foreground">{j.customer_name}</p>
                      <p className="text-[9px] text-muted-foreground font-semibold">Service: {(j.service || "").toUpperCase()}</p>
                      <p className="text-[9px] text-muted-foreground font-bold">Estimate: ₹{j.estimated_price}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground text-center italic mt-4 border border-dashed border-border rounded-xl p-6">
              Click on any slot box in the grid to view scheduled bookings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
