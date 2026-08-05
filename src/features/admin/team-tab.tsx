import { useState, useMemo } from "react";
import { UserCog, Search, RefreshCw, Users, ShieldCheck, Trash, Edit, Check, X, Plus } from "lucide-react";
import type { UserRow } from "./types";
import { ROLES } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  users: UserRow[];
  meId?: string | undefined;
  onSetRole: (userId: string, role: string) => void;
  onRefresh: () => void;
  onDeleteUser?: (userId: string) => void;
};

export function TeamTab({ users, meId, onSetRole, onRefresh, onDeleteUser }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("technician");
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 600);
  }

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert("Name and Phone number are required.");
      return;
    }
    setCreatingStaff(true);
    try {
      const randomUuid = crypto.randomUUID();
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: randomUuid,
          full_name: newName,
          phone: newPhone,
          role: newRole,
          is_on_duty: true
        } as any);

      if (error) {
        alert("Error creating profile: " + error.message);
      } else {
        alert("Staff member profile created successfully.");
        setNewName("");
        setNewPhone("");
        setIsCreating(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingStaff(false);
    }
  }

  function startEdit(u: UserRow) {
    setEditingId(u.id);
    setEditName(u.full_name || "");
    setEditPhone(u.phone || "");
  }

  async function saveEdit(userId: string) {
    if (!editName.trim() || !editPhone.trim()) {
      alert("Name and phone number cannot be blank.");
      return;
    }
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          phone: editPhone
        })
        .eq("id", userId);

      if (error) {
        alert("Error saving: " + error.message);
      } else {
        setEditingId(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  }

  const stats = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    const total = list.length;
    const admins = list.filter((u) => u.role === "admin").length;
    const techs = list.filter((u) => u.role === "technician").length;
    const drivers = list.filter((u) => u.role === "driver").length;
    const customers = list.filter((u) => u.role === "customer").length;
    return { total, admins, techs, drivers, customers };
  }, [users]);

  const filtered = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const summaryCards = [
    { label: "Total Accounts", val: stats.total, icon: <Users size={16} />, color: "text-foreground bg-secondary/50 border-border" },
    { label: "Administrators", val: stats.admins, icon: <ShieldCheck size={16} />, color: "text-emerald bg-emerald/10 border-emerald/20" },
    { label: "Technicians", val: stats.techs, icon: <UserCog size={16} />, color: "text-royal bg-royal/10 border-royal/20" },
    { label: "Logistics Drivers", val: stats.drivers, icon: <UserCog size={16} />, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {summaryCards.map((c, i) => (
          <div key={i} className={`bg-card border p-4 rounded-xl flex items-center gap-3.5 shadow-soft ${c.color}`}>
            <div className="p-2 rounded-lg bg-background border border-border shrink-0">
              {c.icon}
            </div>
            <div>
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <span className="font-display text-lg font-black text-foreground block mt-0.5">
                {c.val}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Creation workspace toggle */}
      {isCreating && (
        <div className="bg-card border border-border p-5 rounded-2xl shadow-soft space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Add New Team Member Profile</h3>
            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreateStaff} className="grid gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Staff Member Name"
                className="w-full p-2.5 rounded-xl border border-border bg-background outline-none text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full p-2.5 rounded-xl border border-border bg-background outline-none text-xs font-semibold"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider mb-1.5">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background outline-none text-xs font-bold"
                >
                  <option value="technician">Technician</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creatingStaff}
                className="py-2.5 px-5 bg-teal text-white rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lift hover:bg-teal/90 disabled:opacity-50 shrink-0 h-[38px] cursor-pointer"
              >
                {creatingStaff ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <UserCog size={16} className="text-teal" /> Staff Directory & Roles
          </h2>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="py-1 px-2.5 bg-teal/10 border border-teal/20 text-teal hover:bg-teal/15 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus size={10} /> Add Crew
            </button>
          )}
        </div>

        {/* Directory Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
              <Search size={13} />
            </span>
            <input
              type="text"
              placeholder="Search directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold outline-none"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}s Only
              </option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-secondary transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
          No profiles match the search parameters.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filtered.map((u) => {
                const isEditingThis = editingId === u.id;
                return (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      {isEditingThis ? (
                        <div className="space-y-2 max-w-xs">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border border-border rounded-lg bg-background text-xs font-bold"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full p-2 border border-border rounded-lg bg-background text-xs font-bold"
                            placeholder="Phone number"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-xs">
                            {u.full_name || "Unnamed Profile"}
                            {u.id === meId && (
                              <span className="ml-2 bg-teal/10 border border-teal/20 text-teal px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{u.email || "No Email linked"}</p>
                          {u.phone && <p className="text-[10px] text-royal font-semibold">{u.phone}</p>}
                        </>
                      )}
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isEditingThis ? (
                          <>
                            <button
                              disabled={savingEdit}
                              onClick={() => saveEdit(u.id)}
                              className="p-1.5 border border-teal/20 bg-teal/5 text-teal hover:bg-teal/10 rounded-xl transition-all cursor-pointer"
                              title="Save Changes"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 border border-border bg-background text-muted-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="p-1.5 border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer"
                              title="Edit Member Name/Phone"
                            >
                              <Edit size={13} />
                            </button>
                            {u.id !== meId && onDeleteUser && (
                              <button
                                onClick={() => onDeleteUser(u.id)}
                                className="p-1.5 border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                                title="Delete User Profile"
                              >
                                <Trash size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
