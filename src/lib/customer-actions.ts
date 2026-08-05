import { z } from "zod";
import { ROLES, cancelBookingSchema, rescheduleBookingSchema } from "./schemas";
import { supabase } from "@/integrations/supabase/client";

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

/** True when `date` (YYYY-MM-DD) is at least 12 hours in the future. */
function isOutsideCancellationWindow(date: string): boolean {
  const pickup = new Date(`${date}T00:00:00`);
  const now = new Date();
  return pickup.getTime() - now.getTime() >= 12 * 60 * 60 * 1000;
}

function isFutureDate(date: string): boolean {
  const d = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

/** Bookings created by the signed-in customer. */
export async function getMyBookings(): Promise<{ success: boolean; error: string | null; data?: any[] }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null, data };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function cancelMyBooking({ data }: { data: { id: string; reason?: string | null } }) {
  const parsed = cancelBookingSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid request: ${validationError(parsed.error)}`);
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, status, pickup_date")
      .eq("id", parsed.data.id)
      .eq("customer_id", userId)
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!booking) return invalid("Booking not found or does not belong to your account.");
    if (booking.status === "cancelled") return invalid("This booking is already cancelled.");
    if (!isOutsideCancellationWindow(booking.pickup_date)) {
      return invalid("Free cancellation is only allowed at least 12 hours before pickup.");
    }
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: parsed.data.reason ?? null,
      })
      .eq("id", parsed.data.id);
    if (updateError) return { success: false, error: updateError.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}

export async function rescheduleMyBooking({ data }: { data: { id: string; pickup_date: string; pickup_slot: string } }) {
  const parsed = rescheduleBookingSchema.safeParse(data);
  if (!parsed.success) return invalid(`Invalid request: ${validationError(parsed.error)}`);
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return { success: false, error: "Not authenticated" };

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, status, pickup_date")
      .eq("id", parsed.data.id)
      .eq("customer_id", userId)
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!booking) return invalid("Booking not found or does not belong to your account.");
    if (booking.status === "cancelled") return invalid("A cancelled booking cannot be rescheduled.");
    if (!isOutsideCancellationWindow(booking.pickup_date)) {
      return invalid("Free rescheduling is only allowed at least 12 hours before pickup.");
    }
    if (!isFutureDate(parsed.data.pickup_date)) {
      return invalid("Pickup date must be today or later.");
    }
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ pickup_date: parsed.data.pickup_date, pickup_slot: parsed.data.pickup_slot })
      .eq("id", parsed.data.id);
    if (updateError) return { success: false, error: updateError.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: errMsg(err) };
  }
}
