import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { makeOrderRef } from "./booking";

function getAdminClient() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

export const getBookings = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const { data: updated, error } = await supabaseAdmin
        .from("bookings")
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq("id", data.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: updated };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const createBookingAdmin = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const orderRef = makeOrderRef();
      const { data: inserted, error } = await supabaseAdmin
        .from("bookings")
        .insert({
          ...data,
          order_ref: orderRef,
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: inserted };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const getBlockedDates = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const { data, error } = await supabaseAdmin
        .from("blocked_dates")
        .select("*")
        .order("blocked_on", { ascending: true });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const addBlockedDate = createServerFn({ method: "POST" })
  .validator((data: { date: string; reason: string }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const { data: inserted, error } = await supabaseAdmin
        .from("blocked_dates")
        .insert({ blocked_on: data.date, reason: data.reason })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: inserted };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const deleteBlockedDate = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
      return { success: false, error: "missing_credentials" };
    }
    try {
      const { error } = await supabaseAdmin
        .from("blocked_dates")
        .delete()
        .eq("id", data);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
