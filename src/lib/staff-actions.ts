import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getServerClient } from "./db";
import { requireRole } from "@/integrations/supabase/role-guard";
import { advanceStatusSchema } from "./schemas";

type StaffContext = { userId: string; role: string };

function validationError(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.length > 0 ? `${i.path.join(".")}: ` : ""}${i.message}`)
    .join("; ");
}

function invalid(message: string): { success: false; error: string } {
  return { success: false, error: message };
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Which status transitions each role may set on their assigned bookings.
const TECHNICIAN_STATUSES = ["collected", "cleaning", "drying", "quality_check"];
const DRIVER_STATUSES = ["out_for_delivery", "delivered"];

/** Bookings assigned to the signed-in technician or driver. */
export const getMyAssignedBookings = createServerFn({ method: "GET" })
  .middleware([requireRole(["technician", "driver"])])
  .handler(async ({ context }) => {
    const { userId, role } = context as unknown as StaffContext;
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const column = role === "technician" ? "assigned_technician_id" : "assigned_driver_id";
      const { data, error } = await db
        .from("bookings")
        .select("*")
        .eq(column, userId)
        .order("pickup_date", { ascending: true });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });

/** Advance the status of a booking assigned to the signed-in staff member. */
export const advanceAssignedStatus = createServerFn({ method: "POST" })
  .middleware([requireRole(["technician", "driver"])])
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const parsed = advanceStatusSchema.safeParse(data);
    if (!parsed.success) return invalid(`Invalid status: ${validationError(parsed.error)}`);
    const { userId, role } = context as unknown as StaffContext;
    const allowed = role === "technician" ? TECHNICIAN_STATUSES : DRIVER_STATUSES;
    if (!allowed.includes(parsed.data.status)) {
      return invalid(`Role "${role}" cannot set status "${parsed.data.status}".`);
    }
    const db = getServerClient();
    if (!db) return { success: false, error: "missing_credentials" };
    try {
      const column = role === "technician" ? "assigned_technician_id" : "assigned_driver_id";
      const { data: booking, error } = await db
        .from("bookings")
        .select("id, status")
        .eq("id", parsed.data.id)
        .eq(column, userId)
        .maybeSingle();
      if (error) return { success: false, error: error.message };
      if (!booking) return invalid("Booking not found or not assigned to you.");
      if (booking.status === "cancelled") return invalid("This booking was cancelled.");
      const { error: updateError } = await db
        .from("bookings")
        .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
        .eq("id", parsed.data.id);
      if (updateError) return { success: false, error: updateError.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: errMsg(err) };
    }
  });
