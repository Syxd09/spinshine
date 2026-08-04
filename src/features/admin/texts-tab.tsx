import type { CmsTexts } from "@/lib/cms-content";

type Props = {
  texts: CmsTexts;
  setTexts: (next: CmsTexts) => void;
};

export function TextsTab({ texts, setTexts }: Props) {
  const set = (patch: Partial<CmsTexts>) => setTexts({ ...texts, ...patch });

  return (
    <div className="bg-card border border-border p-8 rounded-2xl shadow-soft space-y-6">
      <h2 className="text-lg font-bold text-foreground">Homepage Editorial Texts</h2>

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
