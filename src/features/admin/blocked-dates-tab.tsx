import { useState, type FormEvent } from "react";
import { Trash2, Calendar, Search } from "lucide-react";
import { addBlockedDate, deleteBlockedDate } from "@/lib/admin-actions";
import type { BlockedDateRow } from "./types";

type Props = {
  blockedDays: BlockedDateRow[];
  isLocalMode: boolean;
  onChanged: () => void;
};

export function BlockedDatesTab({ blockedDays, isLocalMode, onChanged }: Props) {
  const [dateType, setDateType] = useState<"single" | "range">("single");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (dateType === "single") {
        if (!date) return;
        const res = await addBlockedDate({ data: { date, reason } });
        if (res.success) {
          setDate("");
          setReason("");
          onChanged();
        } else {
          alert("Failed to block date: " + res.error);
        }
      } else {
        if (!startDate || !endDate) return;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
          alert("End date must be after start date.");
          return;
        }

        // Loop through all dates in range and insert them
        const datesToBlock: string[] = [];
        const current = new Date(start);
        while (current <= end) {
          datesToBlock.push(current.toISOString().split("T")[0]!);
          current.setDate(current.getDate() + 1);
        }

        // Insert sequential blocked dates
        for (const d of datesToBlock) {
          await addBlockedDate({ data: { date: d, reason } });
        }
        
        setStartDate("");
        setEndDate("");
        setReason("");
        onChanged();
        alert(`Successfully blocked ${datesToBlock.length} dates in range.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (isLocalMode) return onChanged();
    const res = await deleteBlockedDate({ data: { id } });
    if (res.success) onChanged();
    else alert("Failed to delete blocked date: " + res.error);
  }

  const list = Array.isArray(blockedDays) ? blockedDays : [];

  // Filter blocked dates based on search query
  const filteredList = list.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.blocked_on.includes(q) || (d.reason && d.reason.toLowerCase().includes(q));
  });

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-foreground">Active Blocked Dates ({filteredList.length})</h2>
          
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search blocked dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
            No matching blocked dates found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredList.map((d) => (
              <div
                key={d.id}
                className="bg-card border border-border p-5 rounded-2xl shadow-soft flex justify-between items-center gap-3"
              >
                <div>
                  <strong className="text-sm font-bold text-foreground">{d.blocked_on}</strong>
                  <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                    {d.reason || "No reason specified"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
          <Calendar size={16} /> Block Booking Slots
        </h2>

        {/* Date Selector Mode Toggle */}
        <div className="flex bg-secondary p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDateType("single")}
            className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              dateType === "single"
                ? "bg-background text-foreground shadow-lift"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Single Date
          </button>
          <button
            type="button"
            onClick={() => setDateType("range")}
            className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              dateType === "range"
                ? "bg-background text-foreground shadow-lift"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Date Range
          </button>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          {dateType === "single" ? (
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Block Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
              placeholder="e.g. System Maintenance, National Holiday"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all cursor-pointer disabled:opacity-40"
          >
            {submitting ? "Blocking slots..." : "Apply Block"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
