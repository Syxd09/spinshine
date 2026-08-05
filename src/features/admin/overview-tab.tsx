import { useMemo } from "react";
import { TrendingUp, Clock, CheckCircle, IndianRupee, AlertTriangle, UserCheck } from "lucide-react";
import type { BookingRow } from "./types";
import { STAGE_LABELS } from "@/lib/booking";

type Props = {
  bookings: BookingRow[];
  usersCount: number;
};

export function OverviewTab({ bookings, usersCount }: Props) {
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === "delivered").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const active = total - completed - cancelled;

    // Gross Revenue (excluding cancelled bookings)
    const grossRevenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + (b.estimated_price || 0), 0);

    const avgOrderValue = total > cancelled ? Math.round(grossRevenue / (total - cancelled)) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    // Status Distribution
    const statusCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    // Service Popularity
    const serviceCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.service) {
        serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1;
      }
    });

    // Audit logs (extracted from status_history in bookings)
    interface ActivityItem {
      id: string;
      orderRef: string;
      status: string;
      at: string;
      by: string | null;
      byRole: string | null;
    }

    const activities: ActivityItem[] = [];
    bookings.forEach((b) => {
      if (Array.isArray(b.status_history)) {
        b.status_history.forEach((hist: any, index: number) => {
          activities.push({
            id: `${b.id}-${index}`,
            orderRef: b.order_ref,
            status: hist.status || "updated",
            at: hist.at || b.created_at,
            by: hist.by || "System",
            byRole: hist.byRole || "automatic",
          });
        });
      } else {
        // Fallback activity item for when status_history is missing
        activities.push({
          id: `${b.id}-init`,
          orderRef: b.order_ref,
          status: b.status,
          at: b.updated_at || b.created_at,
          by: b.customer_name || "System",
          byRole: "customer",
        });
      }
    });

    // Sort activities by timestamp descending
    const sortedActivities = activities
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 15);

    return {
      active,
      completed,
      cancelled,
      grossRevenue,
      avgOrderValue,
      cancellationRate,
      statusCounts,
      serviceCounts,
      activities: sortedActivities,
    };
  }, [bookings]);

  const cards = [
    {
      title: "Gross Revenue",
      value: `₹${stats.grossRevenue.toLocaleString("en-IN")}`,
      desc: "Excluding cancelled orders",
      icon: <IndianRupee size={20} />,
      color: "text-emerald bg-emerald/10 border-emerald/20",
    },
    {
      title: "Active Orders",
      value: stats.active,
      desc: "In treatment & delivery pipelines",
      icon: <Clock size={20} />,
      color: "text-royal bg-royal/10 border-royal/20",
    },
    {
      title: "Completed Orders",
      value: stats.completed,
      desc: "Successfully delivered",
      icon: <CheckCircle size={20} />,
      color: "text-teal bg-teal/10 border-teal/20",
    },
    {
      title: "Avg. Ticket Size",
      value: `₹${stats.avgOrderValue}`,
      desc: "Average revenue per order",
      icon: <TrendingUp size={20} />,
      color: "text-gold bg-gold/10 border-gold/20",
    },
    {
      title: "Cancellation Rate",
      value: `${stats.cancellationRate}%`,
      desc: `Total cancelled: ${stats.cancelled}`,
      icon: <AlertTriangle size={20} />,
      color: "text-red-500 bg-red-500/10 border-red-500/20",
    },
    {
      title: "Staff & Team Profiles",
      value: usersCount,
      desc: "Active directory profiles",
      icon: <UserCheck size={20} />,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`bg-card border p-4.5 rounded-2xl flex flex-col justify-between shadow-soft hover:-translate-y-0.5 transition-all duration-300 ${c.color.split(" ").slice(2).join(" ")}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl ${c.color.split(" ").slice(0, 2).join(" ")}`}>
                {c.icon}
              </div>
            </div>
            <div className="mt-3">
              <span className="font-display text-2xl font-black text-foreground block">
                {c.value}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground mt-0.5 block">
                {c.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {/* Operations Distribution */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-6">
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Service Operations Ratios
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Active distribution of orders by current pipeline status
            </p>
          </div>

          <div className="space-y-4.5">
            {Object.entries(STAGE_LABELS).map(([status, label]) => {
              const count = stats.statusCounts[status] || 0;
              const percent = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-foreground">{label}</span>
                    <span className="text-muted-foreground">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-royal h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log / Activity Trail */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft flex flex-col h-[400px]">
          <div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Chronological Audit Trail
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Real-time feed of status updates across active and completed bookings
            </p>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
            {stats.activities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No activity logs available yet.
              </div>
            ) : (
              stats.activities.map((act) => {
                const dateStr = new Date(act.at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div key={act.id} className="flex gap-3 text-xs leading-relaxed items-start">
                    <div className="h-2 w-2 rounded-full bg-teal/60 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Order <span className="font-display font-bold text-royal">{act.orderRef}</span> advanced to{" "}
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-royal">
                          {STAGE_LABELS[act.status] || act.status}
                        </span>
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Changed by <span className="capitalize">{act.byRole}</span> ({act.by})
                      </p>
                    </div>
                    <span className="text-[9px] font-semibold text-muted-foreground shrink-0 mt-0.5">
                      {dateStr}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
