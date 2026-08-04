import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
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

  function addService(e: FormEvent) {
    e.preventDefault();
    if (!key || !name) return;
    setServices([...services, { key, name, unit, rate, desc }]);
    setKey("");
    setName("");
    setDesc("");
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
                <th className="px-6 py-4">Key</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Rate (₹)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {services.map((s, idx) => (
                <tr key={s.key}>
                  <td className="px-6 py-4 text-xs font-mono">{s.key}</td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      className={cellCls}
                    />
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <input
                      type="text"
                      value={s.unit}
                      onChange={(e) => update(idx, { unit: e.target.value })}
                      className={cellCls}
                    />
                  </td>
                  <td className="px-6 py-4 font-display font-extrabold text-royal">
                    <input
                      type="number"
                      value={s.rate}
                      onChange={(e) => update(idx, { rate: parseInt(e.target.value) || 0 })}
                      className={cellClsNum}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setServices(services.filter((_, i) => i !== idx))}
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

      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
          Add New Service Profile
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
              placeholder="e.g. upholstery"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Upholstery Extraction"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                Rate (₹)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Description
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all"
          >
            Add Service Profile
          </button>
        </form>
      </div>
    </div>
  );
}

const cellCls =
  "border border-transparent hover:border-border px-2 py-1 rounded w-full font-bold bg-background";
const cellClsNum =
  "border border-transparent hover:border-border px-2 py-1 rounded w-20 font-bold bg-background";
const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
