import { useMemo, useState, type FormEvent } from "react";
import { Search, Clock, Trash2, Filter } from "lucide-react";
import type { ServiceItem } from "@/lib/booking";
import { updateBookingStatus, createBookingAdmin } from "@/lib/admin-actions";
import { BOOKING_STATUSES, SLOTS, type BookingRow, type UserRow } from "./types";

type Props = {
  bookings: BookingRow[];
  loading: boolean;
  isLocalMode: boolean;
  services: ServiceItem[];
  users: UserRow[];
  onAssign: (bookingId: string, column: "technician" | "driver", userId: string | null) => void;
  onChanged: () => void;
};

export function BookingsTab({
  bookings,
  loading,
  isLocalMode,
  services,
  users,
  onAssign,
  onChanged,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [mbName, setMbName] = useState("");
  const [mbPhone, setMbPhone] = useState("");
  const [mbEmail, setMbEmail] = useState("");
  const [mbAddress, setMbAddress] = useState("");
  const [mbLandmark, setMbLandmark] = useState("");
  const [mbService, setMbService] = useState("curtains");
  const [mbQty, setMbQty] = useState(1);
  const [mbMode, setMbMode] = useState<"pickup" | "onsite">("pickup");
  const [mbDate, setMbDate] = useState("");
  const [mbSlot, setMbSlot] = useState<string>(SLOTS[0]);

  const filtered = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return list.filter((b) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.customer_name?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.order_ref?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const techs = users.filter((u) => u.role === "technician");
  const drivers = users.filter((u) => u.role === "driver");

  async function handleStatusChange(id: string, status: string) {
    if (isLocalMode) return onChanged();
    const res = await updateBookingStatus({ data: { id, status } });
    if (res.success) onChanged();
    else alert("Failed to update status: " + res.error);
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!mbName || !mbPhone || !mbAddress || !mbDate) {
      alert("Please fill in Name, Phone, Address, and Date");
      return;
    }
    const svc = services.find((s) => s.key === mbService);
    const basePrice = svc ? svc.rate * mbQty : 199;
    const price = basePrice + (mbMode === "onsite" ? 199 : 0);

    const res = await createBookingAdmin({
      data: {
        customer_name: mbName,
        phone: mbPhone,
        email: mbEmail || null,
        address: mbAddress,
        landmark: mbLandmark || null,
        service: mbService,
        mode: mbMode,
        pickup_date: mbDate,
        pickup_slot: mbSlot,
        estimated_price: price,
        status: "confirmed",
      },
    });
    if (res.success) {
      setMbName("");
      setMbPhone("");
      setMbEmail("");
      setMbAddress("");
      setMbLandmark("");
      setMbDate("");
      onChanged();
      alert(`Booking manually added! Order Ref: ${res.data.order_ref}`);
    } else {
      alert("Failed to create booking: " + res.error);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Active Customer Orders ({filtered.length})
          </h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search reference/name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-full border border-border bg-card text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-full border border-border bg-card text-xs font-semibold outline-none"
            >
              <option value="all">All Statuses</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-muted-foreground">
            Loading database bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
            No matching bookings found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border p-5 rounded-2xl shadow-soft flex flex-wrap justify-between items-center gap-4 hover:border-royal/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold bg-secondary text-foreground px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {b.order_ref}
                  </span>
                  <h3 className="font-bold text-foreground text-sm">
                    {b.customer_name} ·{" "}
                    <span className="text-muted-foreground text-xs">{b.phone}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                    {(b.service || "").toUpperCase()} ({b.mode}) · {b.pickup_date} {b.pickup_slot} ·{" "}
                    <strong>₹{b.estimated_price}</strong>
                  </p>
                  {b.address && (
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      Address: {b.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isLocalMode && (
                    <button
                      onClick={() => onChanged()}
                      className="p-2 rounded-lg hover:bg-royal/10 text-royal"
                      title="Remove (local mode)"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <select
                    value={b.status}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none"
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                {!isLocalMode && (
                  <div className="w-full flex flex-wrap gap-3 border-t border-border pt-3">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Technician
                      <select
                        value={b.assigned_technician_id ?? ""}
                        onChange={(e) =>
                          onAssign(b.id, "technician", e.target.value || null)
                        }
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-bold text-foreground outline-none normal-case tracking-normal"
                      >
                        <option value="">Unassigned</option>
                        {techs.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || u.email || u.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Driver
                      <select
                        value={b.assigned_driver_id ?? ""}
                        onChange={(e) =>
                          onAssign(b.id, "driver", e.target.value || null)
                        }
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-bold text-foreground outline-none normal-case tracking-normal"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || u.email || u.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
          Create Manual Booking
        </h2>
        <form onSubmit={handleCreateBooking} className="space-y-3.5">
          <Field label="Customer Name">
            <input
              type="text"
              value={mbName}
              onChange={(e) => setMbName(e.target.value)}
              className={inputCls}
              placeholder="John Doe"
            />
          </Field>
          <Field label="Phone Number">
            <input
              type="text"
              value={mbPhone}
              onChange={(e) => setMbPhone(e.target.value)}
              className={inputCls}
              placeholder="e.g. +91 99999 99999"
            />
          </Field>
          <Field label="Email Address (Optional)">
            <input
              type="email"
              value={mbEmail}
              onChange={(e) => setMbEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Address">
            <textarea
              value={mbAddress}
              onChange={(e) => setMbAddress(e.target.value)}
              className={inputCls}
              rows={2}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Service">
              <select
                value={mbService}
                onChange={(e) => setMbService(e.target.value)}
                className={inputCls}
              >
                {services.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input
                type="number"
                min="1"
                value={mbQty}
                onChange={(e) => setMbQty(parseInt(e.target.value) || 1)}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mode">
              <select
                value={mbMode}
                onChange={(e) => setMbMode(e.target.value as "pickup" | "onsite")}
                className={inputCls}
              >
                <option value="pickup">Pickup</option>
                <option value="onsite">On-site</option>
              </select>
            </Field>
            <Field label="Pickup Date">
              <input
                type="date"
                value={mbDate}
                onChange={(e) => setMbDate(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Pickup Slot">
            <select value={mbSlot} onChange={(e) => setMbSlot(e.target.value)} className={inputCls}>
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <button type="submit" className={primaryBtnCls}>
            Insert Order
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
const primaryBtnCls =
  "w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-muted-foreground uppercase">{label}</label>
      {children}
    </div>
  );
}
