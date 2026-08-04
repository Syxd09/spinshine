import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import type { LocalityItem } from "@/lib/booking";

type Props = {
  localities: LocalityItem[];
  setLocalities: (next: LocalityItem[]) => void;
  radiusKm: number;
  setRadiusKm: (next: number) => void;
};

export function CoverageTab({ localities, setLocalities, radiusKm, setRadiusKm }: Props) {
  const [name, setName] = useState("");
  const [km, setKm] = useState(10);

  function addLocality(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setLocalities([...localities, { name, km }]);
    setName("");
    setKm(10);
  }

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
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Locality List Directory
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Locality Name</th>
                  <th className="px-6 py-4">Distance (km)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {localities.map((loc, idx) => (
                  <tr key={loc.name}>
                    <td className="px-6 py-4 font-semibold">{loc.name}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={loc.km}
                        onChange={(e) => {
                          const copy = [...localities];
                          copy[idx] = { ...copy[idx]!, km: parseInt(e.target.value) || 0 };
                          setLocalities(copy);
                        }}
                        className="border border-transparent hover:border-border px-2 py-1 rounded w-20 font-bold bg-background"
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
                        className="p-1 text-royal hover:text-royal/80"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
          Add Locality Zone
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
              placeholder="e.g. Outer Ring Road"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Distance from Hub (km)
            </label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
          >
            Add Area Profile
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
