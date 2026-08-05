import { X, Calendar, MapPin, DollarSign, User, ShieldAlert, Check, RefreshCw, Edit, Save, Plus, Trash } from "lucide-react";
import type { BookingRow, UserRow } from "./types";
import { STAGE_LABELS } from "@/lib/booking";

const STAGE_COLORS: Record<string, string> = {
  confirmed: "bg-amber-500",
  collected: "bg-indigo-500",
  cleaning: "bg-blue-500",
  drying: "bg-orange-500",
  quality_check: "bg-teal-500",
  out_for_delivery: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  bookingId: string | null;
  onClose: () => void;
  bookings: BookingRow[];
  users: UserRow[];
  onAssign: (bookingId: string, column: "technician" | "driver", userId: string | null) => Promise<void>;
  onChanged: () => void;
};

export function BookingInspectorDrawer({
  bookingId,
  onClose,
  bookings,
  users,
  onAssign,
  onChanged,
}: Props) {
  const booking = bookings.find((b) => b.id === bookingId);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [editLineItems, setEditLineItems] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // For adding a new line item
  const [selectedService, setSelectedService] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  // Filter technicians and drivers from users
  const technicians = users.filter((u) => u.role === "technician");
  const drivers = users.filter((u) => u.role === "driver");

  // Load payment details client-side directly from Supabase
  useEffect(() => {
    if (!bookingId) return;
    (supabase as any)
      .from("payments")
      .select("status, method")
      .eq("booking_id", bookingId)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) {
          setPaymentStatus(data.status);
          setPaymentMethod(data.method);
        } else {
          setPaymentStatus("pending");
          setPaymentMethod(booking?.payment_method || "cash");
        }
      });
  }, [bookingId, booking]);

  // Sync edit states
  useEffect(() => {
    if (booking) {
      setEditName(booking.customer_name || "");
      setEditPhone(booking.phone || "");
      setEditEmail(booking.email || "");
      setEditAddress(booking.address ? booking.address.replace(/\s*\[GPS:\s*-?\d+\.\d+,\s*-?\d+\.\d+\]/, "").trim() : "");
      setEditLandmark(booking.landmark || "");
      setEditLineItems(Array.isArray(booking.line_items) ? [...booking.line_items] : []);
    }
  }, [booking, isEditing]);

  if (!booking) return null;

  // Clean coordinate-appended tag from address
  const addressStr = booking.address || "";
  const gpsMatch = addressStr.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
  const mapsLink = gpsMatch
    ? `https://www.google.com/maps/search/?api=1&query=${gpsMatch[1]},${gpsMatch[2]}`
    : null;

  async function handleSaveEdit() {
    if (!booking) return;
    setSavingEdit(true);
    try {
      const itemsTotal = editLineItems.reduce((sum, item) => sum + (item.price || 0), 0);
      const finalPrice = itemsTotal + (booking.mode === "onsite" ? 199 : 0);

      const addressWithGps = gpsMatch
        ? `${editAddress} [GPS: ${gpsMatch[1]}, ${gpsMatch[2]}]`
        : editAddress;

      const { error } = await supabase
        .from("bookings")
        .update({
          customer_name: editName,
          phone: editPhone,
          email: editEmail || null,
          address: addressWithGps,
          landmark: editLandmark || null,
          line_items: editLineItems,
          estimated_price: finalPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      if (error) {
        alert("Failed to save: " + error.message);
      } else {
        setIsEditing(false);
        onChanged();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  }

  function handleAddLineItem() {
    if (!selectedService) return;
    
    // Get service info from catalog settings if possible
    let rate = 199;
    let name = selectedService;
    let unit = "item";
    
    // Check if we have catalog services
    const storedCatalog = localStorage.getItem("ss_catalog_services");
    if (storedCatalog) {
      try {
        const list = JSON.parse(storedCatalog);
        const match = list.find((s: any) => s.key === selectedService);
        if (match) {
          rate = match.rate;
          name = match.name;
          unit = match.unit;
        }
      } catch(e){}
    }

    const newItem = {
      service: selectedService,
      name,
      unit,
      qty: selectedQty,
      rate,
      price: selectedQty * rate,
    };

    setEditLineItems([...editLineItems, newItem]);
    setSelectedService("");
    setSelectedQty(1);
  }

  function handleRemoveLineItem(idx: number) {
    setEditLineItems(editLineItems.filter((_, i) => i !== idx));
  }

  function handleLineItemQtyChange(idx: number, qty: number) {
    const copy = [...editLineItems];
    if (copy[idx]) {
      const item = copy[idx]!;
      item.qty = qty;
      item.price = qty * item.rate;
      setEditLineItems(copy);
    }
  }

  async function handleUpdatePayment(status: "paid" | "pending" | "refunded") {
    if (!bookingId || !booking) return;
    setUpdatingPayment(true);
    try {
      const { data: existing } = await (supabase as any)
        .from("payments")
        .select("id")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any)
          .from("payments")
          .update({ status, method: paymentMethod, received_at: status === "paid" ? new Date().toISOString() : null })
          .eq("booking_id", bookingId);
        if (error) alert("Error updating payment: " + error.message);
      } else {
        const { error } = await (supabase as any)
          .from("payments")
          .insert({
            booking_id: bookingId,
            status,
            method: paymentMethod,
            amount: booking.estimated_price,
            received_at: status === "paid" ? new Date().toISOString() : null,
          });
        if (error) alert("Error inserting payment: " + error.message);
      }
      setPaymentStatus(status);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPayment(false);
    }
  }

  async function handleCancelOrder() {
    if (!booking) return;
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const reason = prompt("Enter cancellation reason (optional):");
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancellation_reason: reason || null })
        .eq("id", booking.id);
      if (error) alert("Error: " + error.message);
      else onChanged();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteOrder() {
    if (!booking) return;
    if (!confirm("CRITICAL WARNING: Are you sure you want to permanently delete this booking record? This cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", booking.id);
      if (error) alert("Error deleting booking: " + error.message);
      else {
        alert("Booking record deleted successfully.");
        onClose();
        onChanged();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdvanceStatus(nextStatus: string) {
    if (!booking) return;
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", booking.id);
      if (error) alert("Error advancing status: " + error.message);
      else onChanged();
    } catch (err) {
      console.error(err);
    }
  }

  // Next logical status to advance to
  const statusWorkflow: Record<string, string> = {
    confirmed: "collected",
    collected: "cleaning",
    cleaning: "drying",
    drying: "quality_check",
    quality_check: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  const nextStatus = statusWorkflow[booking.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Body */}
      <div className="w-full max-w-lg bg-background border-l border-border h-full flex flex-col shadow-2xl animate-slide-in relative">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/20">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Order Inspector
            </span>
            <h1 className="text-xl font-display font-black text-foreground mt-0.5">
              {booking.order_ref}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary text-xs font-bold text-foreground cursor-pointer"
              >
                <Edit size={12} /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal hover:bg-teal/90 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Save size={12} /> Save
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Status Banner */}
          {!isEditing && (
            <div className="flex items-center justify-between p-4 bg-secondary/40 border border-border rounded-2xl">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                  Current Status
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${
                      STAGE_COLORS[booking.status as keyof typeof STAGE_COLORS] || "bg-royal"
                    }`}
                  />
                  <span className="text-sm font-extrabold uppercase tracking-wide text-foreground">
                    {STAGE_LABELS[booking.status as keyof typeof STAGE_LABELS] || booking.status}
                  </span>
                </div>
              </div>
              {nextStatus && (
                <button
                  onClick={() => handleAdvanceStatus(nextStatus)}
                  className="flex items-center gap-1 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-teal rounded-xl hover:bg-teal/95 hover:shadow-glow transition-all cursor-pointer"
                >
                  Advance to {STAGE_LABELS[nextStatus]}
                </button>
              )}
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <User size={12} /> Customer Information
            </h2>
            <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">
                        Full Name
                      </span>
                      <p className="text-xs font-bold text-foreground mt-0.5">
                        {booking.customer_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">
                        Phone Number
                      </span>
                      <p className="text-xs font-bold text-foreground mt-0.5">{booking.phone}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Email Address
                    </span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {booking.email || "No email provided"}
                    </p>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase flex justify-between">
                      Service Address
                      {mapsLink && (
                        <a
                          href={mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-royal font-extrabold hover:underline"
                        >
                          View on Google Maps →
                        </a>
                      )}
                    </span>
                    <p className="text-xs font-medium text-foreground mt-1">
                      {editAddress}
                    </p>
                    {booking.landmark && (
                      <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                        Landmark: {booking.landmark}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg border border-border text-xs font-semibold bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                      Address
                    </label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      rows={2}
                      className="w-full mt-1 p-2 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={editLandmark}
                      onChange={(e) => setEditLandmark(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-border text-xs font-semibold bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items & Estimate */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign size={12} /> Estimate & Line Items
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 border-b border-border text-[9px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-5 py-3">Item / Service</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Rate</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    {isEditing && <th className="px-5 py-3 text-center">Rem</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {(!isEditing ? (booking.line_items as any[] ?? []) : editLineItems).map((li, idx) => (
                    <tr key={idx}>
                      <td className="px-5 py-3 font-semibold">{li.name || li.service}</td>
                      <td className="px-5 py-3 text-center">
                        {!isEditing ? (
                          <span className="font-bold text-muted-foreground">{li.qty}</span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            value={li.qty}
                            onChange={(e) => handleLineItemQtyChange(idx, parseInt(e.target.value) || 1)}
                            className="w-12 text-center rounded border border-border bg-background p-1 text-[11px] font-bold"
                          />
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">₹{li.rate}</td>
                      <td className="px-5 py-3 text-right font-bold">₹{li.price}</td>
                      {isEditing && (
                        <td className="px-5 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-red-500 hover:text-red-600 cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {booking.mode === "onsite" && (
                    <tr>
                      <td className="px-5 py-3 font-semibold text-muted-foreground" colSpan={!isEditing ? 3 : 4}>
                        On-Site Convenience Fee
                      </td>
                      <td className="px-5 py-3 text-right font-bold">₹199</td>
                    </tr>
                  )}
                  <tr className="bg-secondary/20 font-bold border-t border-border">
                    <td className="px-5 py-3" colSpan={!isEditing ? 3 : 4}>
                      Total Estimate
                    </td>
                    <td className="px-5 py-3 text-right text-royal text-sm font-black">
                      ₹{!isEditing ? booking.estimated_price : (editLineItems.reduce((sum, item) => sum + (item.price || 0), 0) + (booking.mode === "onsite" ? 199 : 0))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Add item interface when editing */}
              {isEditing && (
                <div className="p-3 border-t border-border bg-secondary/10 flex gap-2 items-center">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="flex-1 rounded border border-border bg-background p-1.5 text-xs font-semibold"
                  >
                    <option value="">Add item...</option>
                    <option value="curtains">Curtains Cleaning</option>
                    <option value="carpet">Carpet Treatment</option>
                    <option value="sofa">Sofa treatment</option>
                    <option value="mattress">Mattress treatment</option>
                    <option value="blanket">Premium blanket care</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    className="w-12 rounded border border-border bg-background p-1.5 text-xs font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="p-1.5 rounded bg-teal text-white hover:bg-teal/95 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Logistics & Assignment */}
          {!isEditing && (
            <div className="space-y-3">
              <h2 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={12} /> Logistics & Team Allocations
              </h2>
              <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Service Mode
                    </span>
                    <p className="text-xs font-extrabold uppercase text-royal mt-0.5">
                      {booking.mode === "pickup" ? "Hub Pickup & Delivery" : "On-Site Cleaning"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Appointment Slot
                    </span>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {booking.pickup_date} · {booking.pickup_slot}
                    </p>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                      Assign Lead Technician (Cleaning)
                    </label>
                    <select
                      value={booking.assigned_technician_id || ""}
                      onChange={(e) => onAssign(booking.id, "technician", e.target.value || null)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name || "Unnamed"} ({t.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                      Assign Driver (Logistics & Delivery)
                    </label>
                    <select
                      value={booking.assigned_driver_id || ""}
                      onChange={(e) => onAssign(booking.id, "driver", e.target.value || null)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Unassigned</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name || "Unnamed"} ({d.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Manager */}
          {!isEditing && (
            <div className="space-y-3">
              <h2 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign size={12} /> Payment Status Manager
              </h2>
              <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                      Payment Status
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                          paymentStatus === "paid"
                            ? "bg-teal/10 text-teal"
                            : paymentStatus === "refunded"
                              ? "bg-royal/10 text-royal"
                              : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {paymentStatus}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        via {paymentMethod.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={updatingPayment}
                      onClick={() => handleUpdatePayment("paid")}
                      className="p-2 rounded-xl border border-teal/20 bg-teal/5 text-teal hover:bg-teal/10 transition-colors cursor-pointer"
                      title="Mark as Paid"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      disabled={updatingPayment}
                      onClick={() => handleUpdatePayment("pending")}
                      className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                      title="Mark as Pending"
                    >
                      <RefreshCw size={14} className={updatingPayment ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="p-5 border-t border-border bg-secondary/10 flex justify-between gap-3">
            {booking.status !== "cancelled" && booking.status !== "delivered" && (
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-red-500 border border-red-500/30 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert size={14} /> Cancel Order
              </button>
            )}
            <button
              onClick={handleDeleteOrder}
              className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash size={14} /> Delete Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
