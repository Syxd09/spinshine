export type ServiceKey = "curtains" | "carpet" | "sofa" | "mattress" | "blanket" | "upholstery";

export interface ServiceItem {
  key: ServiceKey | string;
  name: string;
  unit: string;
  rate: number;
  onsiteOnly?: boolean;
  desc: string;
}

export interface LocalityItem {
  name: string;
  km: number;
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    key: "curtains",
    name: "Curtain Cleaning",
    unit: "panel",
    rate: 199,
    desc: "Sheers, linen, blackout",
  },
  {
    key: "carpet",
    name: "Carpet Cleaning",
    unit: "carpet",
    rate: 899,
    desc: "Rugs & wall-to-wall",
  },
  { key: "sofa", name: "Sofa Cleaning", unit: "seat", rate: 499, desc: "Fabric & leather" },
  {
    key: "mattress",
    name: "Mattress Cleaning",
    unit: "mattress",
    rate: 899,
    desc: "UV + steam sanitising",
  },
  {
    key: "blanket",
    name: "Blanket Cleaning",
    unit: "item",
    rate: 399,
    desc: "Quilts, duvets, woollens",
  },
  {
    key: "upholstery",
    name: "Upholstery Cleaning",
    unit: "unit",
    rate: 249,
    desc: "Chairs, recliners, office",
  },
];

export const DEFAULT_LOCALITIES: LocalityItem[] = [
  { name: "Koramangala", km: 5 },
  { name: "Indiranagar", km: 6 },
  { name: "HSR Layout", km: 10 },
  { name: "Jayanagar", km: 8 },
  { name: "JP Nagar", km: 11 },
  { name: "Whitefield", km: 18 },
  { name: "Marathahalli", km: 15 },
  { name: "Hebbal", km: 13 },
  { name: "Yelahanka", km: 19 },
  { name: "RR Nagar", km: 16 },
  { name: "Sarjapur Road", km: 17 },
  { name: "Electronic City", km: 22 },
  { name: "Nelamangala", km: 34 },
  { name: "Devanahalli", km: 38 },
  { name: "Hoskote", km: 33 },
];

export const DEFAULT_SETTINGS = {
  radiusKm: 30,
  onsiteFee: 199,
  deliveryDays: 3,
  capacityPerSlot: 4,
  maxQuantity: 50,
  supportPhone: "+91 00000 00000",
  supportWhatsApp: "+910000000000",
} as const;

// Static fallbacks (used by server-rendered pages before hydration and in unit
// tests). The authoritative values come from the database catalog at runtime;
// pages consume those through the `useCatalog()` hook.
export const SERVICES: ServiceItem[] = DEFAULT_SERVICES;
export const LOCALITIES: LocalityItem[] = DEFAULT_LOCALITIES;
export const RADIUS_KM: number = DEFAULT_SETTINGS.radiusKm;
export const ON_SITE_FEE: number = DEFAULT_SETTINGS.onsiteFee;
export const CAPACITY_PER_SLOT: number = DEFAULT_SETTINGS.capacityPerSlot;
export const DELIVERY_DAYS: number = DEFAULT_SETTINGS.deliveryDays;
export const MAX_QUANTITY: number = DEFAULT_SETTINGS.maxQuantity;

export const PAYMENT_METHODS = [
  { key: "upi", label: "UPI", hint: "GPay · PhonePe · Paytm" },
  { key: "card", label: "Card", hint: "Credit / Debit" },
  { key: "cash", label: "Cash on delivery", hint: "Pay after service" },
];

// Single canonical source of truth for booking statuses. Everything else
// (schemas, admin UI, track timeline, server validation) derives from this.
export const BOOKING_STATUSES = [
  "confirmed",
  "collected",
  "cleaning",
  "drying",
  "quality_check",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

// Progression shown on the public track timeline (excludes terminal "cancelled").
export const TRACK_STAGES: readonly (typeof BOOKING_STATUSES)[number][] = BOOKING_STATUSES.filter(
  (s) => s !== "cancelled",
);

export const STAGE_LABELS: Record<string, string> = {
  confirmed: "Booking confirmed",
  collected: "Collected",
  cleaning: "Cleaning",
  drying: "Drying",
  quality_check: "Quality check",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function estimatePrice(
  serviceKey: string,
  qty: number,
  mode: string,
  onsiteFee = ON_SITE_FEE,
) {
  const svc = SERVICES.find((s) => s.key === serviceKey);
  if (!svc) return 0;
  const base = svc.rate * Math.max(1, qty);
  const onsiteCost = mode === "onsite" ? onsiteFee : 0;
  return base + onsiteCost;
}

export function makeOrderRef() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const time = String(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()).padStart(
    5,
    "0",
  );
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SS-${year}${month}${date}-${time}${rand}`;
}

export function nextDays(count: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 1; i <= count; i++) {
    const n = new Date(d);
    n.setDate(d.getDate() + i);
    out.push(n);
  }
  return out;
}

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
