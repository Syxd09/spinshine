import { useState, type FormEvent } from "react";
import { Trash2, ToggleLeft, ToggleRight, Plus, Hash } from "lucide-react";
import type { ServiceItem } from "@/lib/booking";

type Props = {
  services: ServiceItem[];
  setServices: (next: ServiceItem[]) => void;
};

export function ServicesTab({ services, setServices }: Props) {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("item");
  const [rate, setRate] = useState(199);
  const [desc, setDesc] = useState("");
  const [onsiteOnly, setOnsiteOnly] = useState(false);

  function addService(e: FormEvent) {
    e.preventDefault();
    if (!key || !name) return;
    setServices([...services, { key: key.trim().toLowerCase(), name: name.trim(), unit: unit.trim(), rate, desc: desc.trim(), onsiteOnly }]);
    setKey("");
    setName("");
    setDesc("");
    setUnit("item");
    setRate(199);
    setOnsiteOnly(false);
  }

  function update(idx: number, patch: Partial<ServiceItem>) {
    const copy = [...services];
    copy[idx] = { ...copy[idx]!, ...patch };
    setServices(copy);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Active Services Directory</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-4">Key</th>
                <th className="px-5 py-4">Name & Description</th>
                <th className="px-5 py-4">Unit</th>
                <th className="px-5 py-4">Rate (₹)</th>
                <th className="px-5 py-4 text-center">On-Site Only</th>
                <th className="px-5 py-4 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {services.map((s, idx) => (
                <tr key={s.key}>
                  <td className="px-5 py-4 text-xs font-mono">{s.key}</td>
                  <td className="px-5 py-4 space-y-1">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      className="w-full border border-transparent hover:border-border/50 focus:border-royal/50 px-2 py-1 rounded font-bold bg-background text-xs"
                    />
                    <input
                      type="text"
                      value={s.desc || ""}
                      onChange={(e) => update(idx, { desc: e.target.value })}
                      placeholder="Service description"
                      className="w-full border border-transparent hover:border-border/50 focus:border-royal/50 px-2 py-0.5 rounded text-[10px] text-muted-foreground bg-background"
                    />
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <input
                      type="text"
                      value={s.unit}
                      onChange={(e) => update(idx, { unit: e.target.value })}
                      className="w-16 border border-transparent hover:border-border/50 focus:border-royal/50 px-2 py-1 rounded bg-background text-xs font-semibold"
                    />
                  </td>
                  <td className="px-5 py-4 font-display font-extrabold text-royal">
                    <input
                      type="number"
                      value={s.rate}
                      onChange={(e) => update(idx, { rate: parseInt(e.target.value) || 0 })}
                      className="w-20 border border-transparent hover:border-border/50 focus:border-royal/50 px-2 py-1 rounded bg-background text-xs font-bold text-royal"
                    />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => update(idx, { onsiteOnly: !s.onsiteOnly })}
                      className="p-1 text-muted-foreground hover:text-royal transition-colors cursor-pointer"
                    >
                      {s.onsiteOnly ? (
                        <ToggleRight className="text-teal" size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => setServices(services.filter((_, i) => i !== idx))}
                      className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
          <Plus size={16} /> Add New Service Profile
        </h2>
        <form onSubmit={addService} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Unique Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={inputCls}
              placeholder="e.g. leather_jacket"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Service Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Leather Jacket Treatment"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Pricing Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputCls}
                placeholder="e.g. item, panel, seat"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Base Rate (₹)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value) || 0)}
                className={inputCls}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Service Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={`${inputCls} h-16 resize-none`}
              placeholder="Describe the treatment type, care cycle, or exclusions..."
            />
          </div>
          <div className="flex justify-between items-center p-3 border border-border rounded-xl bg-background">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              On-Site Only Service
            </span>
            <button
              type="button"
              onClick={() => setOnsiteOnly((prev) => !prev)}
              className="text-muted-foreground hover:text-royal transition-colors cursor-pointer"
            >
              {onsiteOnly ? (
                <ToggleRight className="text-teal" size={24} />
              ) : (
                <ToggleLeft size={24} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all cursor-pointer"
          >
            Add Service Profile
          </button>
        </form>
      </div>
    </div>
  );
}

const cellCls =
  "border border-transparent hover:border-border px-2 py-1 rounded w-full font-semibold bg-background";
const cellClsNum =
  "border border-transparent hover:border-border px-2 py-1 rounded w-full font-bold bg-background text-royal";
const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
