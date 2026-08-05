import { useState, type FormEvent, useMemo } from "react";
import { Trash2, Plus, Search, Map } from "lucide-react";
import type { LocalityItem } from "@/lib/booking";

type Props = {
  localities: LocalityItem[];
  setLocalities: (next: LocalityItem[]) => void;
  radiusKm: number;
  setRadiusKm: (next: number) => void;
  capacityPerSlot: number;
  setCapacityPerSlot: (next: number) => void;
  deliveryDays: number;
  setDeliveryDays: (next: number) => void;
  onsiteFee: number;
  setOnsiteFee: (next: number) => void;
  maxQuantity: number;
  setMaxQuantity: (next: number) => void;
};

export function CoverageTab({
  localities,
  setLocalities,
  radiusKm,
  setRadiusKm,
  capacityPerSlot,
  setCapacityPerSlot,
  deliveryDays,
  setDeliveryDays,
  onsiteFee,
  setOnsiteFee,
  maxQuantity,
  setMaxQuantity,
}: Props) {
  const [name, setName] = useState("");
  const [km, setKm] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  function addLocality(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setLocalities([...localities, { name: name.trim(), km }]);
    setName("");
    setKm(10);
  }

  function handleUpdateName(idx: number, newName: string) {
    const copy = [...localities];
    if (copy[idx]) {
      copy[idx] = { ...copy[idx]!, name: newName };
      setLocalities(copy);
    }
  }

  function handleUpdateKm(idx: number, newKm: number) {
    const copy = [...localities];
    if (copy[idx]) {
      copy[idx] = { ...copy[idx]!, km: newKm };
      setLocalities(copy);
    }
  }

  const filteredLocalities = useMemo(() => {
    return localities.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localities, searchQuery]);

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Delivery Boundaries</h2>
          <div className="bg-card border border-border p-6 rounded-2xl mt-3 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Pickup & Return Radius Limit
              </label>
              <span className="font-display text-lg font-black text-royal">{radiusKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-royal"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Locality List Directory ({filteredLocalities.length})
            </h2>

            {/* Search filter */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                <Search size={13} />
              </span>
              <input
                type="text"
                placeholder="Search coverage zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Locality Zone Name</th>
                  <th className="px-6 py-4">Distance (km)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filteredLocalities.map((loc, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => handleUpdateName(idx, e.target.value)}
                        className="border border-transparent hover:border-border px-2 py-1 rounded w-full font-bold bg-background text-xs"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={loc.km}
                        onChange={(e) => handleUpdateKm(idx, parseInt(e.target.value) || 0)}
                        className="border border-transparent hover:border-border px-2 py-1 rounded w-20 font-bold bg-background text-xs"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                          loc.km <= radiusKm ? "bg-teal/10 text-teal-700" : "bg-royal/10 text-royal"
                        }`}
                      >
                        {loc.km <= radiusKm ? "Full Coverage" : "On-site Only"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setLocalities(localities.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLocalities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-xs text-muted-foreground font-semibold">
                      No matching localities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Add Locality Form */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
            <Plus size={16} /> Add Locality Zone
          </h2>
          <form onSubmit={addLocality} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Locality Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Outer Ring Road, Hebbal"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Distance from Central Hub (km)
              </label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(parseInt(e.target.value) || 0)}
                className={inputCls}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all cursor-pointer"
            >
              Add Locality Boundary
            </button>
          </form>
        </div>

        {/* Global Operational Capacities Settings */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
            <Map size={16} /> Operational Settings
          </h2>
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                Max Daily Capacity Per Slot
              </label>
              <input
                type="number"
                value={capacityPerSlot}
                onChange={(e) => setCapacityPerSlot(parseInt(e.target.value) || 5)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                Standard Delivery Time (Days)
              </label>
              <input
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 3)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                On-Site convenience Fee (₹)
              </label>
              <input
                type="number"
                value={onsiteFee}
                onChange={(e) => setOnsiteFee(parseInt(e.target.value) || 199)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                Max Booking Item Quantity
              </label>
              <input
                type="number"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(parseInt(e.target.value) || 30)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
