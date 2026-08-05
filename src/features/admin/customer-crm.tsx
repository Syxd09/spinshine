import { useMemo, useState } from "react";
import { Search, UserCheck, Star, Activity, ClipboardList, IndianRupee } from "lucide-react";
import type { BookingRow } from "./types";

type Props = {
  bookings: BookingRow[];
};

type CustomerItem = {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  bookingsCount: number;
  totalSpend: number;
  preferredMode: string;
  lastBookingDate: string;
};

export function CustomerCrm({ bookings }: Props) {
  const [search, setSearch] = useState("");

  const customers = useMemo(() => {
    const map: Record<string, BookingRow[]> = {};
    bookings.forEach((b) => {
      if (b.phone) {
        const key = b.phone.trim();
        if (!map[key]) map[key] = [];
        map[key]!.push(b);
      }
    });

    const list: CustomerItem[] = Object.entries(map).map(([phone, listB]) => {
      // Find latest booking to extract current profile data
      const sorted = [...listB].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latest = sorted[0]!;

      // Calculate total spend excluding cancelled orders
      const totalSpend = listB
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + (b.estimated_price || 0), 0);

      // Find preferred service mode
      const modesCount = listB.reduce((acc, b) => {
        acc[b.mode] = (acc[b.mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const preferredMode = Object.entries(modesCount).reduce((a, b) => (a[1] > b[1] ? a : b), ["pickup", 0])[0];

      return {
        name: latest.customer_name || "Unnamed Customer",
        phone,
        email: latest.email || null,
        address: latest.address || null,
        bookingsCount: listB.length,
        totalSpend,
        preferredMode,
        lastBookingDate: latest.created_at,
      };
    });

    // Sort by lifetime value descending
    return list.sort((a, b) => b.totalSpend - a.totalSpend);
  }, [bookings]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.trim().toLowerCase();
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, search]);

  const crmStats = useMemo(() => {
    const list = customers;
    const total = list.length;
    const highValue = list.filter((c) => c.totalSpend > 2500).length;
    const avgLtv = total > 0 ? Math.round(list.reduce((sum, c) => sum + c.totalSpend, 0) / total) : 0;
    return { total, highValue, avgLtv };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* CRM Stats Summary */}
      <div className="grid gap-4 grid-cols-3">
        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-teal/10 border border-teal/20 text-teal rounded-xl">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Unique Customers</span>
            <span className="text-xl font-black text-foreground block mt-0.5">{crmStats.total}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-royal/10 border border-royal/20 text-royal rounded-xl">
            <Star className="text-gold" size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">High Value (LTV &gt; ₹2.5k)</span>
            <span className="text-xl font-black text-foreground block mt-0.5">{crmStats.highValue}</span>
          </div>
        </div>

        <div className="bg-card border border-border p-4.5 rounded-2xl flex items-center gap-3 shadow-soft">
          <div className="p-2 bg-emerald/10 border border-emerald/20 text-emerald rounded-xl">
            <IndianRupee size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Average Customer LTV</span>
            <span className="text-xl font-black text-foreground block mt-0.5">₹{crmStats.avgLtv}</span>
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Customer Registry Directory</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Profiles and lifetime customer value calculation based on completed and treatment bookings</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
              <Search size={13} />
            </span>
            <input
              type="text"
              placeholder="Search customer records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl text-xs text-muted-foreground bg-card">
            No matching customer records found.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Bookings Count</th>
                  <th className="px-6 py-4">Preferred Mode</th>
                  <th className="px-6 py-4">Lifetime Value (LTV)</th>
                  <th className="px-6 py-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filtered.map((c) => (
                  <tr key={c.phone}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-xs text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.phone}</p>
                      {c.email && <p className="text-[9px] text-muted-foreground">{c.email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <ClipboardList size={13} className="text-muted-foreground" />
                        {c.bookingsCount} orders
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-[9px] font-extrabold uppercase">
                        {c.preferredMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-display font-black text-teal text-sm">
                      ₹{c.totalSpend.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(c.lastBookingDate).toLocaleDateString("en-IN", {
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
    </div>
  );
}
