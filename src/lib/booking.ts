export type ServiceKey =
  | "curtains"
  | "carpet"
  | "sofa"
  | "mattress"
  | "blanket"
  | "upholstery";

export const SERVICES: {
  key: ServiceKey;
  name: string;
  unit: string;
  rate: number;
  onsiteOnly?: boolean;
  desc: string;
}[] = [
  { key: "curtains", name: "Curtain Cleaning", unit: "panel", rate: 199, desc: "Sheers, linen, blackout" },
  { key: "carpet", name: "Carpet Cleaning", unit: "carpet", rate: 899, desc: "Rugs & wall-to-wall" },
  { key: "sofa", name: "Sofa Cleaning", unit: "seat", rate: 499, desc: "Fabric & leather" },
  { key: "mattress", name: "Mattress Cleaning", unit: "mattress", rate: 899, desc: "UV + steam sanitising" },
  { key: "blanket", name: "Blanket Cleaning", unit: "item", rate: 399, desc: "Quilts, duvets, woollens" },
  { key: "upholstery", name: "Upholstery Cleaning", unit: "unit", rate: 249, desc: "Chairs, recliners, office" },
];

export const LOCALITIES: { name: string; km: number }[] = [
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

export const RADIUS_KM = 30;

export const PAYMENT_METHODS = [
  { key: "upi", label: "UPI", hint: "GPay · PhonePe · Paytm" },
  { key: "card", label: "Card", hint: "Credit / Debit" },
  { key: "cash", label: "Cash on delivery", hint: "Pay after service" },
];

export const TRACK_STAGES = [
  "confirmed",
  "collected",
  "cleaning",
  "drying",
  "quality_check",
  "out_for_delivery",
  "delivered",
] as const;

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

export function estimatePrice(serviceKey: ServiceKey, qty: number, mode: string) {
  const svc = SERVICES.find((s) => s.key === serviceKey);
  if (!svc) return 0;
  const base = svc.rate * Math.max(1, qty);
  const onsiteFee = mode === "onsite" ? 199 : 0;
  return base + onsiteFee;
}

export function makeOrderRef() {
  const n = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SS-${new Date().getFullYear().toString().slice(2)}${n}`;
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
