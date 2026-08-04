// Role-based access control for server functions.
// Composes the generated `requireSupabaseAuth` middleware (which validates the
// bearer token and attaches { supabase, userId, claims }) and additionally
// requires the caller's profile role to match one of the allowed roles.
import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";
import { ROLES } from "@/lib/schemas";

type SupabaseAuthContext = {
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string,
        ) => {
          maybeSingle: () => Promise<{ data: { role?: string } | null; error: unknown }>;
        };
      };
    };
  };
  userId: string;
};

function isAllowedRole(role: string, allowed: readonly string[]): boolean {
  return allowed.includes(role);
}

/**
 * Requires an authenticated Supabase session whose profile role is one of
 * `roles`. Attaches `{ role }` to the downstream context.
 */
export function requireRole(roles: readonly string[] = ROLES) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next, context }) => {
      const { supabase, userId } = context as unknown as SupabaseAuthContext;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const role = error ? undefined : profile?.role;

      if (!role || !isAllowedRole(role, roles)) {
        throw new Error("Forbidden: you do not have permission to perform this action.");
      }

      return next({ context: { role } });
    });
}

/** Requires an authenticated user with the `admin` role. */
export const requireAdmin = requireRole(["admin"]);
