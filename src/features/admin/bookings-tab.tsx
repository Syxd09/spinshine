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
  onInspectBooking: (id: string) => void;
};

export function BookingsTab({
  bookings,
  loading,
  isLocalMode,
  services,
  users,
  onAssign,
  onChanged,
  onInspectBooking,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
      alert(`Booking manually added! Order Ref: ${res.data?.order_ref}`);
    } else {
      alert("Failed to create booking: " + res.error);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">
              Active Customer Orders ({filtered.length})
            </h2>
            <div className="flex items-center gap-1 border border-border p-1 bg-secondary/30 rounded-full">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-navy text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-navy text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Map View
              </button>
            </div>
          </div>
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

        {viewMode === "map" ? (
          <BookingsMap bookings={filtered} />
        ) : loading ? (
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
                  {b.address && (() => {
                    const match = b.address.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
                    if (match) {
                      const cleanAddress = b.address.replace(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/, "").trim();
                      return (
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Address: {cleanAddress}{" "}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${match[1]},${match[2]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-teal hover:underline ml-1 font-bold"
                          >
                            📍 View on Maps
                          </a>
                        </p>
                      );
                    }
                    return (
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Address: {b.address}
                      </p>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onInspectBooking(b.id)}
                    className="px-3.5 py-1.5 rounded-lg border border-royal/30 bg-royal/5 text-royal text-xs font-bold uppercase tracking-wider hover:bg-royal/10 transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>
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

import { useEffect, useRef } from "react";

function BookingsMap({ bookings }: { bookings: BookingRow[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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
        leafletMap.current = L.map(mapRef.current).setView([12.9716, 77.5946], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(leafletMap.current);
      }

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add pins for active bookings
      bookings.forEach((b) => {
        if (b.status === "cancelled" || b.status === "delivered") return;
        if (!b.address) return;
        const match = b.address.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
        if (!match) return;

        const latStr = match[1];
        const lngStr = match[2];
        if (!latStr || !lngStr) return;

        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) return;

        // Custom colored markers using SVG DivIcon
        const color = getMarkerColor(b.status);
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <strong style="color: #0F172A; text-transform: uppercase;">${b.order_ref}</strong>
            <div style="margin-top: 4px; font-weight: bold;">${b.customer_name}</div>
            <div style="color: #6B7280; margin-top: 2px;">${(b.service || "").toUpperCase()} (${b.mode})</div>
            <div style="color: #6B7280; margin-top: 2px;">Pickup: ${b.pickup_date} · ${b.pickup_slot}</div>
            <div style="margin-top: 6px; display: inline-block; padding: 2px 6px; border-radius: 9999px; background: ${color}20; color: ${color}; font-weight: 800; font-size: 9px; text-transform: uppercase;">${b.status}</div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon })
          .addTo(leafletMap.current)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
      });
    });

    return () => {
      // Don't tear down map instance instantly to allow smooth switching, but clean on tab unmount
    };
  }, [bookings]);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "delivered": return "#14B8A6";
      case "cancelled": return "#EF4444";
      case "out_for_delivery": return "#2563EB";
      case "confirmed": return "#6B7280";
      default: return "#F59E0B";
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <div
        ref={mapRef}
        className="h-96 rounded-2xl border border-border overflow-hidden bg-secondary shadow-soft z-10"
        style={{ minHeight: "400px" }}
      />
      <div className="flex flex-wrap gap-4 items-center justify-center py-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase border-t border-border bg-card rounded-xl">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6B7280] block" /> Confirmed</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] block" /> In Progress</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] block" /> Out For Delivery</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] block" /> Delivered</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] block" /> Cancelled</div>
      </div>
    </div>
  );
}
