import { z } from "zod";
import { makeOrderRef } from "./booking";
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
import { supabase } from "@/integrations/supabase/client";

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
export async function getMyRole(): Promise<{ success: boolean; error: string | null; role: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: true, error: null, role: "customer" };

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) return { success: false, error: error.message, role: "customer" };
    return { success: true, error: null, role: data?.role || "customer" };
  } catch (err) {
    return { success: false, error: errMsg(err), role: "customer" };
  }
}

// ---- Bookings ---------------------------------------------------------------

export async function getBookings(): Promise<{ success: boolean; error: string | null; data?: any[] }> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null, data };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function updateBookingStatus({ data }: { data: { id: string; status: string } }) {
  const parsed = statusUpdateSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid status update: ${validationError(parsed.error)}`);
  try {
    const { data: updated, error } = await supabase
      .from("bookings")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.id)
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: updated, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function createBookingAdmin({ data }: { data: Record<string, unknown> }) {
  const parsed = bookingCreateSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid booking data: ${validationError(parsed.error)}`);
  try {
    const orderRef = makeOrderRef();
    const { data: inserted, error } = await supabase
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
    return { success: true, data: inserted, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

// ---- Blocked dates ----------------------------------------------------------

export async function getBlockedDates(): Promise<{ success: boolean; error: string | null; data?: any[] }> {
  try {
    const { data, error } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("blocked_on", { ascending: true });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null, data };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function addBlockedDate({ data }: { data: { date: string; reason: string } }) {
  const parsed = blockedDateCreateSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid blocked date: ${validationError(parsed.error)}`);
  try {
    const { data: inserted, error } = await supabase
      .from("blocked_dates")
      .insert({ blocked_on: parsed.data.date, reason: parsed.data.reason ?? null })
      .select()
      .single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: inserted, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function deleteBlockedDate({ data }: { data: { id: string } }) {
  const parsed = blockedDateDeleteSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid request: ${validationError(parsed.error)}`);
  try {
    const { error } = await supabase.from("blocked_dates").delete().eq("id", parsed.data.id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

// ---- Operational config & CMS (admin write-through to the catalog) ----------

export async function saveServices({ data }: { data: ServiceInput[] }) {
  const parsed = serviceListSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid services: ${validationError(parsed.error)}`);
  try {
    const { error } = await supabase.from("services").upsert(
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
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function saveLocalities({ data }: { data: LocalityInput[] }) {
  const parsed = localityListSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid localities: ${validationError(parsed.error)}`);
  try {
    const { error } = await supabase.from("localities").upsert(
      parsed.data.map((l, i) => ({
        name: l.name,
        km: l.km,
        sort_order: l.sortOrder ?? i,
      })),
      { onConflict: "name" },
    );
    if (error) return { success: false, error: error.message };
    invalidateCatalogCache();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function saveSettings({ data }: { data: SettingsInput }) {
  const parsed = settingsSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid settings: ${validationError(parsed.error)}`);
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
    const { error } = await supabase.from("settings").upsert(rows);
    if (error) return { success: false, error: error.message };
    invalidateCatalogCache();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function saveCms({ data }: { data: { texts: unknown; images: unknown; faqs: unknown } }) {
  const parsed = cmsSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid CMS content: ${validationError(parsed.error)}`);
  try {
    const rows: { section: string; key: string; value: Json }[] = [
      { section: "texts", key: "home", value: parsed.data.texts as Json },
      { section: "images", key: "home", value: parsed.data.images as Json },
      { section: "faqs", key: "home", value: parsed.data.faqs as Json },
    ];
    const { error } = await supabase.from("cms_content").upsert(rows);
    if (error) return { success: false, error: error.message };
    invalidateCatalogCache();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

// ---- Team & role management (admin) -----------------------------------------

export async function listUsers(): Promise<{ success: boolean; error: string | null; data?: any[] }> {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, role, full_name, phone, created_at");
    if (error) return { success: false, error: error.message };

    const users = (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.full_name ? `${p.full_name.toLowerCase().replace(/\s+/g, "")}@spinshine.com` : "staff@spinshine.com",
      role: p.role,
      full_name: p.full_name,
      phone: p.phone,
      created_at: p.created_at,
    }));
    return { success: true, error: null, data: users };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function setUserRole({ data }: { data: SetRoleInput }) {
  const parsed = setRoleSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid role change: ${validationError(parsed.error)}`);
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const me = sessionData.session?.user?.id;
    if (parsed.data.role !== "admin" && parsed.data.userId === me) {
      return invalid("You cannot remove your own admin role.");
    }
    const { error } = await supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.userId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

// ---- Booking assignment (admin) ---------------------------------------------

export async function assignTechnician({ data }: { data: AssignStaffInput }) {
  const parsed = assignStaffSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid assignment: ${validationError(parsed.error)}`);
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ assigned_technician_id: parsed.data.userId })
      .eq("id", parsed.data.bookingId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function assignDriver({ data }: { data: AssignStaffInput }) {
  const parsed = assignStaffSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid assignment: ${validationError(parsed.error)}`);
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ assigned_driver_id: parsed.data.userId })
      .eq("id", parsed.data.bookingId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function makeMeAdmin() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function makeMeStaff({ data }: { data: { role: "technician" | "driver" } }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({ role: data.role })
      .eq("id", userId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}
