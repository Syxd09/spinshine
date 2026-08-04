import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getServerClient } from "./db";
import { makeOrderRef } from "./booking";
import { requireAdmin, requireRole } from "@/integrations/supabase/role-guard";
import { ROLES } from "./schemas";
import { invalidateCatalogCache } from "./catalog-actions";
import {
  bookingCreateSchema,
  statusUpdateSchema,
  blockedDateCreateSchema,
  blockedDateDeleteSchema,
  serviceListSchema,
  localityListSchema,
  settingsSchema,
  cmsSchema,
  setRoleSchema,
  assignStaffSchema,
  type ServiceInput,
  type LocalityInput,
  type SettingsInput,
  type SetRoleInput,
  type AssignStaffInput,
} from "./schemas";
import type { Database, Json } from "@/integrations/supabase/types";

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function validationError(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.length > 0 ? `${i.path.join(".")}: ` : ""}${i.message}`)
    .join("; ");
}

function invalid(message: string): { success: false; error: string } {
  return { success: false, error: message };
}

// ---- Auth helpers -----------------------------------------------------------

/** Returns the current authenticated user's profile role. */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireRole(ROLES)])
  .handler(async ({ context }) => {
    return { success: true, role: (context as unknown as { role: string }).role };
  });

// ---- Bookings ---------------------------------------------------------------

export const getBookings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { data, error } = await db
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const parsed = statusUpdateSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid status update: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { data: updated, error } = await db
        .from("bookings")
        .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
        .eq("id", parsed.data.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const createBookingAdmin = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    const parsed = bookingCreateSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid booking data: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const orderRef = makeOrderRef();
      const { data: inserted, error } = await db
        .from("bookings")
        .insert({
          ...parsed.data,
          order_ref: orderRef,
          payment_method: parsed.data.payment_method ?? "cash",
          qty: parsed.data.qty ?? 1,
          line_items: parsed.data.line_items ?? [],
        } as unknown as Database["public"]["Tables"]["bookings"]["Insert"])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: inserted };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

// ---- Blocked dates ----------------------------------------------------------

export const getBlockedDates = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { data, error } = await db
        .from("blocked_dates")
        .select("*")
        .order("blocked_on", { ascending: true });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const addBlockedDate = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: { date: string; reason: string }) => data)
  .handler(async ({ data }) => {
    const parsed = blockedDateCreateSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid blocked date: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { data: inserted, error } = await db
        .from("blocked_dates")
        .insert({ blocked_on: parsed.data.date, reason: parsed.data.reason ?? null })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: inserted };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const deleteBlockedDate = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const parsed = blockedDateDeleteSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid request: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db.from("blocked_dates").delete().eq("id", parsed.data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

// ---- Operational config & CMS (admin write-through to the catalog) ----------

export const saveServices = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: ServiceInput[]) => data)
  .handler(async ({ data }) => {
    const parsed = serviceListSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid services: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db.from("services").upsert(
        parsed.data.map((s) => ({
          key: s.key,
          name: s.name,
          unit: s.unit,
          rate: s.rate,
          description: s.desc ?? "",
          onsite_only: s.onsiteOnly ?? false,
          active: s.active ?? true,
          sort_order: s.sortOrder ?? 0,
        })),
        { onConflict: "key" },
      );
      if (error) return { success: false, error: error.message };
      invalidateCatalogCache();
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const saveLocalities = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: LocalityInput[]) => data)
  .handler(async ({ data }) => {
    const parsed = localityListSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid localities: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db.from("localities").upsert(
        parsed.data.map((l, i) => ({
          name: l.name,
          km: l.km,
          sort_order: l.sortOrder ?? i,
        })),
        { onConflict: "name" },
      );
      if (error) return { success: false, error: error.message };
      invalidateCatalogCache();
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: SettingsInput) => data)
  .handler(async ({ data }) => {
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid settings: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const rows = [
        { key: "radius_km", value: parsed.data.radiusKm },
        { key: "onsite_fee", value: parsed.data.onsiteFee },
        { key: "delivery_days", value: parsed.data.deliveryDays },
        { key: "capacity_per_slot", value: parsed.data.capacityPerSlot },
        { key: "max_quantity", value: parsed.data.maxQuantity },
        { key: "support_phone", value: parsed.data.supportPhone ?? "" },
        { key: "support_whatsapp", value: parsed.data.supportWhatsApp ?? "" },
      ].map((r) => ({
        key: r.key,
        value: typeof r.value === "string" ? r.value : String(r.value),
      }));
      const { error } = await db.from("settings").upsert(rows);
      if (error) return { success: false, error: error.message };
      invalidateCatalogCache();
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const saveCms = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: { texts: unknown; images: unknown; faqs: unknown }) => data)
  .handler(async ({ data }) => {
    const parsed = cmsSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid CMS content: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const rows: { section: string; key: string; value: Json }[] = [
        { section: "texts", key: "home", value: parsed.data.texts as Json },
        { section: "images", key: "home", value: parsed.data.images as Json },
        { section: "faqs", key: "home", value: parsed.data.faqs as Json },
      ];
      const { error } = await db.from("cms_content").upsert(rows);
      if (error) return { success: false, error: error.message };
      invalidateCatalogCache();
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

// ---- Team & role management (admin) -----------------------------------------

type AuthUserContext = { userId: string };

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const [profilesRes, usersRes] = await Promise.all([
        db.from("profiles").select("id, role, full_name, phone, created_at"),
        db.auth.admin.listUsers({ page: 1, perPage: 200 }),
      ]);
      if (profilesRes.error) return { success: false, error: profilesRes.error.message };
      if (usersRes.error) return { success: false, error: usersRes.error.message };
      const emails = new Map((usersRes.data.users ?? []).map((u) => [u.id, u.email]));
      const users = (profilesRes.data ?? []).map((p) => ({
        id: p.id,
        email: emails.get(p.id) ?? "",
        role: p.role,
        full_name: p.full_name,
        phone: p.phone,
        created_at: p.created_at,
      }));
      return { success: true, data: users };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: SetRoleInput) => data)
  .handler(async ({ data, context }) => {
    const parsed = setRoleSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid role change: ${validationError(parsed.error)}`);
    const me = (context as unknown as AuthUserContext).userId;
    if (parsed.data.role !== "admin" && parsed.data.userId === me) {
      return invalid("You cannot remove your own admin role.");
    }
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db
        .from("profiles")
        .update({ role: parsed.data.role })
        .eq("id", parsed.data.userId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

// ---- Booking assignment (admin) ---------------------------------------------

export const assignTechnician = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: AssignStaffInput) => data)
  .handler(async ({ data }) => {
    const parsed = assignStaffSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid assignment: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db
        .from("bookings")
        .update({ assigned_technician_id: parsed.data.userId })
        .eq("id", parsed.data.bookingId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

export const assignDriver = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: AssignStaffInput) => data)
  .handler(async ({ data }) => {
    const parsed = assignStaffSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid assignment: ${validationError(parsed.error)}`);
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db
        .from("bookings")
        .update({ assigned_driver_id: parsed.data.userId })
        .eq("id", parsed.data.bookingId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const makeMeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as unknown as { userId: string };
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const { error } = await db
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });
