import type { CmsTexts } from "@/lib/cms-content";
import { useState } from "react";
import { Plus, X } from "lucide-react";

type Props = {
  texts: CmsTexts;
  setTexts: (next: CmsTexts) => void;
};

export function TextsTab({ texts, setTexts }: Props) {
  const [newTrustItem, setNewTrustItem] = useState("");
  const set = (patch: Partial<CmsTexts>) => setTexts({ ...texts, ...patch });

  function handleAddTrustItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrustItem.trim()) return;
    const current = Array.isArray(texts.trustList) ? texts.trustList : [];
    set({ trustList: [...current, newTrustItem.trim()] });
    setNewTrustItem("");
  }

  function handleRemoveTrustItem(index: number) {
    const current = Array.isArray(texts.trustList) ? texts.trustList : [];
    set({ trustList: current.filter((_, i) => i !== index) });
  }

  function handleUpdateStep(index: number, key: "t" | "c", val: string) {
    const currentSteps = Array.isArray(texts.steps) ? [...texts.steps] : [];
    if (currentSteps[index]) {
      currentSteps[index] = { ...currentSteps[index]!, [key]: val };
      set({ steps: currentSteps });
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-soft space-y-6">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
          Homepage Editorial Texts
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Hero Title Heading">
            <input
              type="text"
              value={texts.heroHeading}
              onChange={(e) => set({ heroHeading: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Hero Subtitle">
            <input
              type="text"
              value={texts.heroSubheading}
              onChange={(e) => set({ heroSubheading: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Hero Italic Highlight">
            <input
              type="text"
              value={texts.heroItalic}
              onChange={(e) => set({ heroItalic: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Live Slot Label">
            <input
              type="text"
              value={texts.availabilityLabel}
              onChange={(e) => set({ availabilityLabel: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Live Slot Value">
              <input
                type="text"
                value={texts.availabilityValue}
                onChange={(e) => set({ availabilityValue: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Hero Description Paragraph">
              <textarea
                value={texts.heroDesc}
                onChange={(e) => set({ heroDesc: e.target.value })}
                className={inputCls}
                rows={3}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trust Badges Tag Editor */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
            Homepage Trust Badges
          </h2>
          <div className="flex flex-wrap gap-2 min-h-16 p-3 bg-secondary/30 rounded-xl border border-border">
            {(texts.trustList || []).map((badge, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-background border border-border px-2.5 py-1.5 rounded-full text-xs font-bold text-foreground"
              >
                {badge}
                <button
                  type="button"
                  onClick={() => handleRemoveTrustItem(idx)}
                  className="text-muted-foreground hover:text-red-500 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTrustItem} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 5-Star Rated Service"
              value={newTrustItem}
              onChange={(e) => setNewTrustItem(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-background outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-navy hover:bg-royal text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        {/* Treatment Workflow Step Editor */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
            Treatment Workflow Steps
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {(texts.steps || []).map((step, idx) => (
              <div key={idx} className="p-4 border border-border bg-secondary/20 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-display font-black text-royal text-sm">Step {step.n || `0${idx + 1}`}</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={step.t}
                    onChange={(e) => handleUpdateStep(idx, "t", e.target.value)}
                    placeholder="Step Title"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-border bg-background"
                  />
                  <textarea
                    value={step.c}
                    onChange={(e) => handleUpdateStep(idx, "c", e.target.value)}
                    placeholder="Step Description Paragraph"
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1.5 p-3 rounded-xl border border-border text-xs font-bold bg-background";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase">{label}</label>
      {children}
    </div>
  );
}
