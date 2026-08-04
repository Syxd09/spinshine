import { Plus, Trash2 } from "lucide-react";
import type { FaqCategory } from "@/lib/cms-content";

type Props = {
  faqs: FaqCategory[];
  setFaqs: (next: FaqCategory[]) => void;
};

export function FaqsTab({ faqs, setFaqs }: Props) {
  function addQuestion(catIdx: number) {
    const copy = faqs.map((c, i) =>
      i === catIdx
        ? {
            ...c,
            questions: [...c.questions, { q: "New Question Title?", a: "New Answer text here..." }],
          }
        : c,
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
      i === catIdx ? { ...c, questions: c.questions.filter((_, j) => j !== qIdx) } : c,
    );
    setFaqs(copy);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground">FAQ Categories & Questions</h2>

      {faqs.map((cat, catIdx) => (
        <div
          key={cat.id}
          className="bg-card border border-border p-6 rounded-2xl shadow-soft space-y-4"
        >
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-extrabold text-foreground text-sm flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              {cat.label}
            </h3>
            <button
              onClick={() => addQuestion(catIdx)}
              className="flex items-center gap-1 text-[10px] font-extrabold text-teal uppercase tracking-widest bg-teal/5 border border-teal/10 px-3 py-1 rounded-full hover:bg-teal/10"
            >
              <Plus size={12} /> Add Q&A
            </button>
          </div>

          <div className="space-y-4">
            {cat.questions.map((qItem, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-xl border border-border bg-background space-y-3 relative group"
              >
                <button
                  onClick={() => removeQuestion(catIdx, qIdx)}
                  className="absolute top-4 right-4 text-royal opacity-50 hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <div className="pr-8">
                  <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                    Question
                  </label>
                  <input
                    type="text"
                    value={qItem.q}
                    onChange={(e) => updateQuestion(catIdx, qIdx, { q: e.target.value })}
                    className="w-full mt-1.5 p-2 rounded border border-border text-xs font-bold bg-background"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-muted-foreground uppercase">
                    Answer
                  </label>
                  <textarea
                    value={qItem.a}
                    onChange={(e) => updateQuestion(catIdx, qIdx, { a: e.target.value })}
                    className="w-full mt-1.5 p-2 rounded border border-border text-xs font-semibold bg-background"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
