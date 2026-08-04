import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { addBlockedDate, deleteBlockedDate } from "@/lib/admin-actions";
import type { BlockedDateRow } from "./types";

type Props = {
  blockedDays: BlockedDateRow[];
  isLocalMode: boolean;
  onChanged: () => void;
};

export function BlockedDatesTab({ blockedDays, isLocalMode, onChanged }: Props) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    const res = await addBlockedDate({ data: { date, reason } });
    if (res.success) {
      setDate("");
      setReason("");
      onChanged();
    } else {
      alert("Failed to block date: " + res.error);
    }
  }

  async function handleDelete(id: string) {
    if (isLocalMode) return onChanged();
    const res = await deleteBlockedDate({ data: { id } });
    if (res.success) onChanged();
    else alert("Failed to delete blocked date: " + res.error);
  }

  const list = Array.isArray(blockedDays) ? blockedDays : [];

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Active Blocked Dates ({list.length})</h2>
        {list.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
            No dates are blocked.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((d) => (
              <div
                key={d.id}
                className="bg-card border border-border p-5 rounded-2xl shadow-soft flex justify-between items-center gap-3"
              >
                <div>
                  <strong className="text-sm font-bold text-foreground">{d.blocked_on}</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {d.reason || "No reason specified"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-2 rounded-lg hover:bg-royal/10 text-royal transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
          Block a Date
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Block Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
              placeholder="e.g. System Maintenance"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
          >
            Confirm Date Block
          </button>
        </form>
      </div>
    </div>
  );
}
