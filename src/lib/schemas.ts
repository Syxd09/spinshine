import { z } from "zod";
import { BOOKING_STATUSES } from "./booking";

export const SERVICE_KEYS = [
  "curtains",
  "carpet",
  "sofa",
  "mattress",
  "blanket",
  "upholstery",
] as const;

export const SERVICE_MODES = ["pickup", "onsite"] as const;
export const PAYMENT_KEYS = ["upi", "card", "cash"] as const;

export const ROLES = ["customer", "admin", "technician", "driver"] as const;

export const ROLE_SCHEMA = z.enum(ROLES);
export const SERVICE_KEY_SCHEMA = z.enum(SERVICE_KEYS);
export const ORDER_STATUS_SCHEMA = z.enum(BOOKING_STATUSES);
export const SERVICE_MODE_SCHEMA = z.enum(SERVICE_MODES);
export const PAYMENT_KEY_SCHEMA = z.enum(PAYMENT_KEYS);

const phoneSchema = z
  .string()
  .min(8)
  .max(20)
  .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number");

export const bookingCreateSchema = z.object({
  service: z.string().min(1),
  mode: SERVICE_MODE_SCHEMA,
  customer_name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  email: z.string().trim().email().max(120).optional().nullable(),
  address: z.string().trim().min(5).max(300),
  landmark: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(300).optional().nullable(),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "pickup_date must be YYYY-MM-DD"),
  pickup_slot: z.string().min(1),
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  delivery_slot: z.string().min(1).optional().nullable(),
  estimated_price: z.number().int().min(0).max(1_000_000),
  payment_method: PAYMENT_KEY_SCHEMA.optional(),
  status: ORDER_STATUS_SCHEMA,
  order_ref: z.string().min(3).max(30).optional(),
  qty: z.number().int().min(1).max(1000).optional(),
  line_items: z
    .array(
      z.object({
        service: z.string().min(1),
        name: z.string().min(1).max(80).optional(),
        unit: z.string().max(40).optional(),
        qty: z.number().int().min(1),
        rate: z.number().int().min(0),
        price: z.number().int().min(0),
      }),
    )
    .max(50)
    .optional(),
});

export const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: ORDER_STATUS_SCHEMA,
});

export const blockedDateCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(200).optional(),
});

export const blockedDateDeleteSchema = z.object({
  id: z.string().uuid(),
});

export const serviceSchema = z.object({
  key: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  unit: z.string().trim().min(1).max(40),
  rate: z.number().int().min(0).max(1_000_000),
  desc: z.string().trim().max(200).optional().nullable(),
  onsiteOnly: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const localitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  km: z.number().int().min(0).max(200),
  sortOrder: z.number().int().min(0).optional(),
});

export const settingsSchema = z.object({
  radiusKm: z.number().int().min(1).max(200),
  onsiteFee: z.number().int().min(0).max(100_000),
  deliveryDays: z.number().int().min(1).max(30),
  capacityPerSlot: z.number().int().min(1).max(100),
  maxQuantity: z.number().int().min(1).max(1000),
  supportPhone: z.string().max(40).optional().nullable(),
  supportWhatsApp: z.string().max(40).optional().nullable(),
});

export const cmsTextsSchema = z.object({
  heroHeading: z.string().max(120),
  heroSubheading: z.string().max(120),
  heroItalic: z.string().max(80),
  heroDesc: z.string().max(500),
  availabilityLabel: z.string().max(80),
  availabilityValue: z.string().max(80),
  trustList: z.array(z.string().max(120)).max(20),
  steps: z
    .array(z.object({ n: z.string().max(4), t: z.string().max(80), c: z.string().max(300) }))
    .max(12),
  links: z.array(z.object({ name: z.string().max(80), to: z.string().max(80) })).max(20),
});

export const cmsImagesSchema = z.record(z.string(), z.string().max(2000));

export const faqCategorySchema = z.object({
  id: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(120),
  questions: z
    .array(z.object({ q: z.string().min(1).max(400), a: z.string().min(1).max(2000) }))
    .max(100),
});

export const cmsSchema = z.object({
  texts: cmsTextsSchema,
  images: cmsImagesSchema,
  faqs: z.array(faqCategorySchema).max(20),
});

export const serviceListSchema = z.array(serviceSchema);
export const localityListSchema = z.array(localitySchema);

export const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: ROLE_SCHEMA,
});

export const assignStaffSchema = z.object({
  bookingId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
});

export const cancelBookingSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().max(200).optional().nullable(),
});

export const rescheduleBookingSchema = z.object({
  id: z.string().uuid(),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickup_slot: z.string().min(1),
});

export const advanceStatusSchema = z.object({
  id: z.string().uuid(),
  status: ORDER_STATUS_SCHEMA,
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type LocalityInput = z.infer<typeof localitySchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type CmsInput = z.infer<typeof cmsSchema>;
export type SetRoleInput = z.infer<typeof setRoleSchema>;
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;
