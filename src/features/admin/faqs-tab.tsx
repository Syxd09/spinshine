import { useState } from "react";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import type { FaqCategory } from "@/lib/cms-content";

type Props = {
  faqs: FaqCategory[];
  setFaqs: (next: FaqCategory[]) => void;
};

export function FaqsTab({ faqs, setFaqs }: Props) {
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatId, setNewCatId] = useState("");

  function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatLabel.trim() || !newCatId.trim()) return;
    const catId = newCatId.trim().toLowerCase().replace(/\s+/g, "-");
    
    // Check if category ID already exists
    if (faqs.some((c) => c.id === catId)) {
      alert("Category ID already exists!");
      return;
    }

    setFaqs([
      ...faqs,
      {
        id: catId,
        label: newCatLabel.trim(),
        questions: [],
      },
    ]);
    setNewCatLabel("");
    setNewCatId("");
  }

  function removeCategory(catIdx: number) {
    if (!confirm("Are you sure you want to delete this entire FAQ category and all its questions?")) return;
    setFaqs(faqs.filter((_, i) => i !== catIdx));
  }

  function updateCategoryLabel(catIdx: number, newLabel: string) {
    const copy = faqs.map((c, i) => (i === catIdx ? { ...c, label: newLabel } : c));
    setFaqs(copy);
  }

  function addQuestion(catIdx: number) {
    const copy = faqs.map((c, i) =>
      i === catIdx
        ? {
            ...c,
            questions: [...c.questions, { q: "New Question?", a: "Answer details..." }],
          }
        : c
    );
    setFaqs(copy);
  }

  function updateQuestion(catIdx: number, qIdx: number, patch: Partial<{ q: string; a: string }>) {
    const copy = faqs.map((c, i) => {
      if (i !== catIdx) return c;
      const questions = c.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q));
      return { ...c, questions };
    });
    setFaqs(copy);
  }

  function removeQuestion(catIdx: number, qIdx: number) {
    const copy = faqs.map((c, i) =>
      i === catIdx ? { ...c, questions: c.questions.filter((_, j) => j !== qIdx) } : c
    );
    setFaqs(copy);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-start">
      {/* Category List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-foreground">FAQ Categories & Questions</h2>

        {faqs.map((cat, catIdx) => (
          <div
            key={cat.id}
            className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4"
          >
            <div className="flex justify-between items-center border-b border-border pb-3 gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) => updateCategoryLabel(catIdx, e.target.value)}
                  className="font-extrabold text-foreground text-sm bg-transparent border-b border-transparent hover:border-border/50 focus:border-royal/50 focus:bg-background px-2 py-0.5 rounded outline-none w-full max-w-xs"
                />
                <span className="block text-[9px] text-muted-foreground pl-2 font-mono">ID: {cat.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addQuestion(catIdx)}
                  className="flex items-center gap-1 text-[10px] font-extrabold text-teal uppercase tracking-widest bg-teal/5 border border-teal/10 px-3 py-1.5 rounded-full hover:bg-teal/10 cursor-pointer"
                >
                  <Plus size={12} /> Add Q&A
                </button>
                <button
                  onClick={() => removeCategory(catIdx)}
                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cat.questions.map((qItem, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border border-border bg-background space-y-3 relative group"
                >
                  <button
                    onClick={() => removeQuestion(catIdx, qIdx)}
                    className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="pr-8">
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                      Question
                    </label>
                    <input
                      type="text"
                      value={qItem.q}
                      onChange={(e) => updateQuestion(catIdx, qIdx, { q: e.target.value })}
                      className="w-full mt-1.5 p-2 rounded-lg border border-border text-xs font-bold bg-background outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                      Answer
                    </label>
                    <textarea
                      value={qItem.a}
                      onChange={(e) => updateQuestion(catIdx, qIdx, { a: e.target.value })}
                      className="w-full mt-1.5 p-2 rounded-lg border border-border text-xs font-semibold bg-background outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {cat.questions.length === 0 && (
                <p className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No questions in this category. Click "Add Q&A" to begin.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Sidebar */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-1.5">
          <FolderPlus size={16} /> Add FAQ Category
        </h2>
        <form onSubmit={addCategory} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Category ID (URL key)
            </label>
            <input
              type="text"
              value={newCatId}
              onChange={(e) => setNewCatId(e.target.value)}
              className={inputCls}
              placeholder="e.g. pricing-payments"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-muted-foreground uppercase">
              Category Label (Title)
            </label>
            <input
              type="text"
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              className={inputCls}
              placeholder="e.g. Pricing & Payments"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-navy text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-royal hover:shadow-glow transition-all cursor-pointer"
          >
            Add Category
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full mt-1 p-2.5 rounded-lg border border-border text-xs font-semibold bg-background";
