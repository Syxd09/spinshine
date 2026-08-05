export type BookingRow = {
  id: string;
  order_ref: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  landmark?: string | null;
  service: string;
  mode: string;
  pickup_date: string;
  pickup_slot: string;
  delivery_date?: string | null;
  delivery_slot?: string | null;
  estimated_price: number;
  payment_method?: string;
  status: string;
  created_at: string;
  updated_at: string;
  qty?: number;
  line_items?: { service: string; name?: string; unit?: string; qty: number; rate: number; price: number }[];
  customer_id?: string | null;
  assigned_technician_id?: string | null;
  assigned_driver_id?: string | null;
  status_history?: { status: string; at: string; by?: string | null; byRole?: string | null }[];
  cancellation_reason?: string | null;
  notes?: string | null;
};

export type PaymentRow = {
  id: string;
  booking_id: string;
  method: "upi" | "card" | "cash";
  amount: number;
  status: "pending" | "paid" | "refunded";
  received_at?: string | null;
  notes?: string | null;
  created_at: string;
};

export type UserRow = {
  id: string;
  email?: string;
  role: string;
  full_name?: string | null;
  phone?: string | null;
  created_at: string;
  is_on_duty?: boolean;
};

export type BlockedDateRow = {
  id: string;
  blocked_on: string;
  reason?: string | null;
  created_at: string;
};

// Canonical status list lives in @/lib/booking (single source of truth).
export { BOOKING_STATUSES } from "@/lib/booking";

export const SLOTS = [
  "8:00 – 10:00 AM",
  "10:00 – 12:00 PM",
  "12:00 – 2:00 PM",
  "2:00 – 4:00 PM",
  "4:00 – 6:00 PM",
  "6:00 – 8:00 PM",
] as const;
