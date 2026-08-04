import { UserCog } from "lucide-react";
import type { UserRow } from "./types";
import { ROLES } from "@/lib/schemas";

type Props = {
  users: UserRow[];
  meId?: string | undefined;
  onSetRole: (userId: string, role: string) => void;
  onRefresh: () => void;
};

export function TeamTab({ users, meId, onSetRole, onRefresh }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <UserCog size={18} className="text-teal" /> Team & Roles
        </h2>
        <button
          onClick={onRefresh}
          className="rounded-full border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors"
        >
          Refresh users
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
          No users yet. Signups will appear here.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-xs">
                      {u.full_name || u.email || "Unnamed user"}
                      {u.id === meId && (
                        <span className="ml-2 bg-teal/10 border border-teal/20 text-teal px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{u.email}</p>
                    {u.phone && <p className="text-[10px] text-muted-foreground">{u.phone}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      disabled={u.id === meId}
                      onChange={(e) => onSetRole(u.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
